import * as React from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  // Separar triggers y contents
  const triggers: React.ReactElement[] = [];
  const contents: React.ReactElement[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = (child.type as { displayName?: string })?.displayName;
    if (type === 'TabsList') {
      triggers.push(React.cloneElement(child as React.ReactElement<Record<string, unknown>>, { setActiveTab, activeTab }));
    } else if (type === 'TabsContent') {
      contents.push(child);
    }
  });
  return (
    <div>
      {triggers.map((trigger, index) => (
        <React.Fragment key={`trigger-${index}`}>{trigger}</React.Fragment>
      ))}
      {contents
        .filter((content) => {
          if (!React.isValidElement<{ value: string }>(content)) return false;
          return content.props.value === activeTab;
        })
        .map((content, index) => (
          <React.Fragment key={`content-${index}`}>{content}</React.Fragment>
        ))}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  setActiveTab?: (v: string) => void;
  activeTab?: string;
}

export function TabsList({ children, className, setActiveTab, activeTab }: TabsListProps) {
  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        // React.Children.map ya maneja las keys automáticamente
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, { 
          setActiveTab, 
          activeTab
        });
      })}
    </div>
  );
}
TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  setActiveTab?: (v: string) => void;
  activeTab?: string;
}

export function TabsTrigger({ value, children, setActiveTab, activeTab }: TabsTriggerProps) {
  const isActive = activeTab === value;
  return (
    <button
      className={`px-4 py-2 rounded-t bg-white border-b-2 font-medium focus:outline-none ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}
      onClick={() => setActiveTab && setActiveTab(value)}
      type="button"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ children }: TabsContentProps) {
  // El renderizado condicional se maneja en Tabs
  return <div>{children}</div>;
}
TabsContent.displayName = 'TabsContent';
