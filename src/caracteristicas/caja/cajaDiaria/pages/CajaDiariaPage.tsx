import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DoorOpen, DoorClosed, PlusCircle, MinusCircle } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getFechaLocal } from '@/lib/utils';
import CashBalanceCard from '../components/CashBalanceCard';
import SalesSummary from '../components/SalesSummary';
import TransactionsTable from '../components/TransactionsTable';
import AbrirCajaModal from '../components/AbrirCajaModal';
import CerrarCajaModal from '../components/CerrarCajaModal';
import AgregarIngresoModal from '../components/AgregarIngresoModal';
import AgregarEgresoModal from '../components/AgregarEgresoModal';
import type { SesionCaja, Transaccion, ResumenCaja } from '../types/index';

export default function CajaDiariaPage() {
  const [sesionActual, setSesionActual] = useState<SesionCaja | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [resumen, setResumen] = useState<ResumenCaja>({
    totalVentas: 0,
    totalEfectivo: 0,
    totalYape: 0,
    totalTransferencias: 0,
    totalGastos: 0,
    totalIngresosExtra: 0
  });
  const [mostrarModalAbrir, setMostrarModalAbrir] = useState(false);
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false);
  const [mostrarModalIngreso, setMostrarModalIngreso] = useState(false);
  const [mostrarModalEgreso, setMostrarModalEgreso] = useState(false);
  const [loading, setLoading] = useState(true);

  const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';
  
  // Usar función utilitaria para calcular fecha local
  const fechaHoy = getFechaLocal();

  // Buscar sesión de caja ABIERTA del día actual
  useEffect(() => {
    const q = query(
      collection(db, 'sesionesCaja'),
      where('fecha', '==', fechaHoy),
      where('estado', '==', 'Abierta')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const sessionData = { id: doc.id, ...doc.data() } as SesionCaja;
        setSesionActual(sessionData);
      } else {
        setSesionActual(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar sesión de caja:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fechaHoy]);

  // Leer transacciones de la sesión activa
  useEffect(() => {
    if (!sesionActual) {
      setTransacciones([]);
      return;
    }

    // Leer ventas desde la hora de apertura de la sesión
    const ventasQuery = query(
      collection(db, 'ventas'),
      where('fecha', '>=', sesionActual.horaApertura),
      orderBy('fecha', 'desc')
    );

    // Leer gastos desde la hora de apertura de la sesión
    const gastosQuery = query(
      collection(db, 'gastos'),
      where('fecha', '>=', sesionActual.horaApertura),
      orderBy('fecha', 'desc')
    );

    // Leer movimientos manuales de esta sesión
    const movimientosQuery = query(
      collection(db, 'movimientosManuales'),
      where('sesionCajaId', '==', sesionActual.id),
      orderBy('fecha', 'desc')
    );

    const unsubVentas = onSnapshot(ventasQuery, (snapshot) => {
      const ventas = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: 'Venta' as const,
            numero: data.numeroVenta || '',
            descripcion: `Venta - ${data.clienteNombre || 'Cliente'}`,
            descripcionSecundaria: data.clienteNombre,
            metodo: (data.metodoPago || 'Efectivo') as 'Efectivo' | 'Yape' | 'Transferencia Bancaria',
            monto: Number(data.total) || 0,
            usuario: data.usuario || '',
            fecha: data.fecha
          } as Transaccion;
        })
        .filter(venta => {
          if (!sesionActual.horaCierre) {
            return true;
          }
          return venta.fecha.toMillis() <= sesionActual.horaCierre.toMillis();
        });

      setTransacciones(prev => {
        const otros = prev.filter(t => t.tipo !== 'Venta' && t.tipo !== 'Cobro');
        return [...ventas, ...otros].sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());
      });
    });

    const unsubGastos = onSnapshot(gastosQuery, (snapshot) => {
      const gastos = snapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'Gasto' as const,
        ...doc.data()
      } as Transaccion));

      setTransacciones(prev => {
        const otros = prev.filter(t => t.tipo !== 'Gasto' && t.tipo !== 'Pago');
        return [...otros, ...gastos].sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());
      });
    });

    const unsubMovimientos = onSnapshot(movimientosQuery, (snapshot) => {
      const movimientos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo as 'Ingreso Manual' | 'Egreso Manual',
          numero: data.numero || '',
          descripcion: data.descripcion || '',
          descripcionSecundaria: data.descripcionSecundaria,
          metodo: data.metodo as 'Efectivo' | 'Yape' | 'Transferencia Bancaria',
          monto: Number(data.monto) || 0,
          usuario: data.usuario || '',
          fecha: data.fecha,
          motivo: data.motivo
        } as Transaccion;
      });

      setTransacciones(prev => {
        const otros = prev.filter(t => t.tipo !== 'Ingreso Manual' && t.tipo !== 'Egreso Manual');
        return [...otros, ...movimientos].sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());
      });
    });

    return () => {
      unsubVentas();
      unsubGastos();
      unsubMovimientos();
    };
  }, [sesionActual]);

  // Calcular resumen financiero
  useEffect(() => {
    const nuevoResumen: ResumenCaja = {
      totalVentas: 0,
      totalEfectivo: 0,
      totalYape: 0,
      totalTransferencias: 0,
      totalGastos: 0,
      totalIngresosExtra: 0
    };

    transacciones.forEach(t => {
      const monto = t.monto || 0;

      if (t.tipo === 'Venta' || t.tipo === 'Cobro') {
        nuevoResumen.totalVentas += monto;

        if (t.metodo === 'Efectivo') {
          nuevoResumen.totalEfectivo += monto;
        } else if (t.metodo === 'Yape') {
          nuevoResumen.totalYape += monto;
        } else if (t.metodo === 'Transferencia Bancaria') {
          nuevoResumen.totalTransferencias += monto;
        }
      } else if (t.tipo === 'Gasto' || t.tipo === 'Pago' || t.tipo === 'Egreso Manual') {
        nuevoResumen.totalGastos += monto;
      } else if (t.tipo === 'Ingreso Manual') {
        nuevoResumen.totalIngresosExtra += monto;
        
        // Los ingresos manuales también se suman al método correspondiente
        if (t.metodo === 'Efectivo') {
          nuevoResumen.totalEfectivo += monto;
        } else if (t.metodo === 'Yape') {
          nuevoResumen.totalYape += monto;
        } else if (t.metodo === 'Transferencia Bancaria') {
          nuevoResumen.totalTransferencias += monto;
        }
      }
    });

    setResumen(nuevoResumen);

    // Actualizar totales en la sesión
    if (sesionActual && sesionActual.id && sesionActual.estado === 'Abierta') {
      const totalCalculado = (sesionActual.montoInicial || 0) + nuevoResumen.totalVentas - nuevoResumen.totalGastos;

      updateDoc(doc(db, 'sesionesCaja', sesionActual.id), {
        totalVentas: nuevoResumen.totalVentas,
        totalEfectivo: nuevoResumen.totalEfectivo,
        totalYape: nuevoResumen.totalYape,
        totalTransferencias: nuevoResumen.totalTransferencias,
        totalGastos: nuevoResumen.totalGastos,
        totalIngresosExtra: nuevoResumen.totalIngresosExtra,
        totalCalculado
      });
    }
  }, [transacciones, sesionActual]);

  const handleAbrirCaja = async (montoInicial: number) => {
    try {
      // Siempre crear una nueva sesión (cada apertura es independiente)
      await addDoc(collection(db, 'sesionesCaja'), {
        fecha: fechaHoy,
        estado: 'Abierta',
        montoInicial,
        horaApertura: Timestamp.now(),
        usuarioApertura: userName,
        totalVentas: 0,
        totalEfectivo: 0,
        totalYape: 0,
        totalTransferencias: 0,
        totalGastos: 0,
        totalIngresosExtra: 0,
        totalCalculado: montoInicial
      });
    } catch (error) {
      console.error('Error al abrir caja:', error);
      throw error;
    }
  };

  const handleCerrarCaja = async (montoFinal: number) => {
    if (!sesionActual || !sesionActual.id) return;

    try {
      const totalCalculado = (sesionActual.montoInicial || 0) + resumen.totalVentas - resumen.totalGastos;
      const diferencia = montoFinal - totalCalculado;

      await updateDoc(doc(db, 'sesionesCaja', sesionActual.id), {
        estado: 'Cerrada',
        montoFinal,
        horaCierre: Timestamp.now(),
        usuarioCierre: userName,
        totalCalculado,
        diferencia
      });
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      throw error;
    }
  };

  const handleAgregarIngreso = async (datos: {
    monto: number;
    motivo: string;
    metodo: 'Efectivo' | 'Yape' | 'Transferencia Bancaria';
  }) => {
    if (!sesionActual || !sesionActual.id) return;

    try {
      await addDoc(collection(db, 'movimientosManuales'), {
        tipo: 'Ingreso Manual',
        monto: datos.monto,
        motivo: datos.motivo,
        metodo: datos.metodo,
        usuario: userName,
        fecha: Timestamp.now(),
        sesionCajaId: sesionActual.id,
        numero: `ING-${Date.now()}`,
        descripcion: `Ingreso Manual - ${datos.motivo}`,
        descripcionSecundaria: datos.motivo
      });
    } catch (error) {
      console.error('Error al agregar ingreso:', error);
      throw error;
    }
  };

  const handleAgregarEgreso = async (datos: {
    monto: number;
    motivo: string;
    metodo: 'Efectivo' | 'Yape' | 'Transferencia Bancaria';
  }) => {
    if (!sesionActual || !sesionActual.id) return;

    try {
      await addDoc(collection(db, 'movimientosManuales'), {
        tipo: 'Egreso Manual',
        monto: datos.monto,
        motivo: datos.motivo,
        metodo: datos.metodo,
        usuario: userName,
        fecha: Timestamp.now(),
        sesionCajaId: sesionActual.id,
        numero: `EGR-${Date.now()}`,
        descripcion: `Egreso Manual - ${datos.motivo}`,
        descripcionSecundaria: datos.motivo
      });
    } catch (error) {
      console.error('Error al agregar egreso:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const esCajaAbierta = sesionActual?.estado === 'Abierta';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Caja Diaria</h1>
          <p className="text-gray-500 mt-1">Gestión de apertura, cierre y movimientos de caja</p>
        </div>
        <div className="flex gap-2">
          {!sesionActual && (
            <Button onClick={() => setMostrarModalAbrir(true)} className="bg-blue-600 hover:bg-blue-700">
              <DoorOpen className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          )}
          {esCajaAbierta && (
            <>
              <Button 
                onClick={() => setMostrarModalIngreso(true)} 
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Ingreso
              </Button>
              <Button 
                onClick={() => setMostrarModalEgreso(true)} 
                className="bg-orange-600 hover:bg-orange-700"
              >
                <MinusCircle className="h-4 w-4 mr-2" />
                Agregar Egreso
              </Button>
              <Button onClick={() => setMostrarModalCerrar(true)} className="bg-red-600 hover:bg-red-700">
                <DoorClosed className="h-4 w-4 mr-2" />
                Cerrar Caja
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estado de Caja */}
      <CashBalanceCard sesion={sesionActual} />

      {/* Resumen de Ventas */}
      {sesionActual && <SalesSummary resumen={resumen} />}

      {/* Tabla de Transacciones */}
      {sesionActual && <TransactionsTable transacciones={transacciones} />}

      {/* Modales */}
      <AbrirCajaModal
        isOpen={mostrarModalAbrir}
        onClose={() => setMostrarModalAbrir(false)}
        onConfirm={handleAbrirCaja}
        userName={userName}
      />

      {sesionActual && (
        <>
          <CerrarCajaModal
            isOpen={mostrarModalCerrar}
            onClose={() => setMostrarModalCerrar(false)}
            onConfirm={handleCerrarCaja}
            userName={userName}
            resumen={resumen}
            montoInicial={sesionActual.montoInicial || 0}
          />
          
          <AgregarIngresoModal
            isOpen={mostrarModalIngreso}
            onClose={() => setMostrarModalIngreso(false)}
            onConfirm={handleAgregarIngreso}
            userName={userName}
          />
          
          <AgregarEgresoModal
            isOpen={mostrarModalEgreso}
            onClose={() => setMostrarModalEgreso(false)}
            onConfirm={handleAgregarEgreso}
            userName={userName}
          />
        </>
      )}
    </div>
  );
}
