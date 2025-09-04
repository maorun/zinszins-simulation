import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { Input } from './input'
import { Label } from './label'
import { Slider as ShadcnSlider } from './slider'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button as ShadcnButton } from './button'
import { RadioTileGroup } from './radio-tile'
import { toast } from 'sonner'

// Form context for RSuite-style form value binding
const FormContext = React.createContext<{
  formValue?: any;
  onChange?: (value: any) => void;
} | null>(null);

// Hook to access form context
const useFormContext = () => {
  return React.useContext(FormContext);
};

// Enhanced Panel component with proper collapsible functionality
export const Panel = ({ 
  header, 
  children, 
  bordered: _bordered, 
  collapsible = false, 
  bodyFill: _bodyFill, 
  expanded = true,
  defaultExpanded = true,
  className = "",
  ...props 
}: any) => {
  const [isOpen, setIsOpen] = React.useState(expanded !== undefined ? expanded : defaultExpanded);
  
  if (!collapsible) {
    // Non-collapsible panel - just render as a regular Card
    return (
      <Card className={cn("mb-6", className)} {...props}>
        {header && (
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{header}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    );
  }

  // Collapsible panel using Radix UI Collapsible
  return (
    <Card className={cn("mb-6", className)} {...props}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {header && (
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left text-lg">{header}</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
        )}
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Form component stubs
export const Form = ({ children, onSubmit, formValue, onChange, ...props }: any) => (
  <FormContext.Provider value={{ formValue, onChange }}>
    <form onSubmit={onSubmit ? (e) => { e.preventDefault(); onSubmit(); } : undefined} {...props}>
      {children}
    </form>
  </FormContext.Provider>
);

Form.Group = ({ children, className = "", controlId: _controlId, ...props }: any) => (
  <div className={cn("mb-4 space-y-2", className)} {...props}>{children}</div>
);

Form.ControlLabel = ({ children, ...props }: any) => (
  <Label {...props}>{children}</Label>
);

export const FormControl = ({ 
  accepter, 
  name,
  placeholder,
  value,
  onChange,
  fluid: _fluid,
  min,
  max,
  step,
  format,
  ...props 
}: any) => {
  const formContext = useFormContext();
  const actualValue = formContext?.formValue?.[name] || value;
  const actualOnChange = (newValue: any) => {
    if (formContext?.onChange) {
      formContext.onChange({ ...formContext.formValue, [name]: newValue });
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const validInputProps = { ...props };
  delete validInputProps.handleTitle;
  delete validInputProps.fluid;
  
  if (accepter === DatePicker) {
    return (
      <DatePicker
        name={name}
        value={actualValue}
        onChange={actualOnChange}
        format={format}
        placeholder={placeholder}
        style={{ width: _fluid ? '100%' : undefined }}
        {...validInputProps}
      />
    );
  }
  if (accepter === InputNumber) {
    return (
      <Input 
        type="number"
        name={name}
        placeholder={placeholder}
        value={actualValue || ''}
        onChange={(e) => actualOnChange(Number(e.target.value) || 0)}
        style={{ width: _fluid ? '100%' : undefined }}
        min={min}
        max={max}
        step={step}
        {...validInputProps}
      />
    );
  }
  if (accepter === Slider) {
    return (
      <div className="space-y-2">
        <ShadcnSlider 
          value={[actualValue || 0]}
          onValueChange={(values: number[]) => actualOnChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="mt-2"
          {...validInputProps}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{min}</span>
          <span className="font-medium text-gray-900">{actualValue || 0}%</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
  if (accepter === RadioTileGroup) {
    return (
      <RadioTileGroup 
        value={actualValue}
        onValueChange={actualOnChange}
        {...validInputProps}
      >
        {props.children}
      </RadioTileGroup>
    );
  }
  if (accepter === Toggle) {
    return (
      <Toggle 
        checked={actualValue}
        onCheckedChange={actualOnChange}
        {...validInputProps}
      />
    );
  }
  return (
    <Input 
      name={name}
      placeholder={placeholder}
      value={actualValue || ''}
      onChange={(e) => actualOnChange(e.target.value)}
      style={{ width: _fluid ? '100%' : undefined }}
      {...validInputProps}
    />
  );
};

Form.Control = FormControl;

Form.HelpText = ({ children, className = "", ...props }: any) => (
  <div className={cn("text-sm text-muted-foreground mt-1", className)} {...props}>
    {children}
  </div>
);

// Re-export Button from shadcn with appearance prop compatibility
export const Button = ({ appearance, startIcon, ...props }: any) => {
  let variant = 'default';
  if (appearance === 'primary') variant = 'default';
  if (appearance === 'ghost') variant = 'ghost';
  if (appearance === 'subtle') variant = 'secondary';
  
  return (
    <ShadcnButton variant={variant as any} {...props}>
      {startIcon && <span style={{ marginRight: '0.5rem' }}>{startIcon}</span>}
      {props.children}
    </ShadcnButton>
  );
};

export const ButtonToolbar = ({ children, ...props }: any) => (
  <div className="flex gap-2" {...props}>{children}</div>
);

export const DatePicker = ({ value, onChange, format, placeholder, ...props }: any) => {
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (format === 'yyyy-MM') {
      return d.toISOString().substring(0, 7);
    }
    return d.toISOString().substring(0, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      onChange && onChange(null);
      return;
    }
    
    const date = new Date(inputValue + (format === 'yyyy-MM' ? '-01' : ''));
    if (!isNaN(date.getTime())) {
      onChange && onChange(date);
    }
  };

  return (
    <Input
      type={format === 'yyyy-MM' ? 'month' : 'date'}
      value={formatDate(value)}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  );
};

export const InputNumber = ({ value, onChange, min, max, step, placeholder, fluid: _fluid, ...props }: any) => (
  <Input
    type="number"
    value={value || ''}
    onChange={(e) => onChange && onChange(e.target.value ? Number(e.target.value) : undefined)}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    style={{ width: _fluid ? '100%' : undefined }}
    {...props}
  />
);

export const Message = ({ type, children, ...props }: any) => (
  <div className={cn(
    "p-3 rounded-md",
    type === 'success' && "bg-green-50 text-green-800",
    type === 'info' && "bg-blue-50 text-blue-800",
    type === 'warning' && "bg-yellow-50 text-yellow-800",
    type === 'error' && "bg-red-50 text-red-800",
    !type && "bg-gray-50 text-gray-800"
  )} {...props}>
    {children}
  </div>
);

export const useToaster = () => ({
  push: (message: any, _options?: any) => {
    if (React.isValidElement(message)) {
      const props: any = message.props;
      if (props.type === 'success') {
        toast.success(props.children);
      } else if (props.type === 'info') {
        toast.info(props.children);
      } else {
        toast(props.children);
      }
    } else {
      toast(message);
    }
  }
});

export const Radio = ({ children, value, checked, onChange, ...props }: any) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input 
      type="radio" 
      value={value} 
      checked={checked}
      onChange={onChange}
      {...props} 
    />
    {children}
  </label>
);

export const RadioGroup = ({ children, value, onChange, inline, ...props }: any) => (
  <div className={cn(inline ? "flex gap-4" : "space-y-2")} {...props}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const childProps = child.props as any;
      return React.cloneElement(child as any, { 
        checked: childProps.value === value,
        onChange: () => onChange && onChange(childProps.value)
      });
    })}
  </div>
);

export const Slider = ({ value, onChange, min, max, step, handleTitle: _handleTitle, ...props }: any) => (
  <div className="space-y-2">
    <ShadcnSlider 
      value={[value || 0]}
      onValueChange={(values: number[]) => onChange && onChange(values[0])}
      min={min}
      max={max}
      step={step}
      className="mt-2"
      {...props}
    />
    <div className="flex justify-between text-sm text-gray-500">
      <span>{min}</span>
      <span className="font-medium text-gray-900">{value || 0}{typeof value === 'number' && value < 1 ? '' : ''}</span>
      <span>{max}</span>
    </div>
  </div>
);

export const Toggle = ({ checked, onChange, onCheckedChange, ...props }: any) => {
  const handleChange = onCheckedChange || onChange;
  
  return (
    <label className="inline-flex items-center cursor-pointer gap-2">
      <input 
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange && handleChange(e.target.checked)}
        className="w-5 h-5 accent-blue-600"
        {...props}
      />
      <span className="text-sm">
        {checked ? 'Aktiviert' : 'Deaktiviert'}
      </span>
    </label>
  );
};

export const Divider = ({ ...props }: any) => (
  <hr className="my-4 border-gray-200" {...props} />
);

export const IconButton = ({ children, onClick, ...props }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center justify-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
    {...props}
  >
    {children}
  </button>
);

export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
  </svg>
);

// Export RadioTile components
export { RadioTile, RadioTileGroup } from './radio-tile';