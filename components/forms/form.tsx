import { FormHTMLAttributes, ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';

type FormProps = {
  children: ReactNode;
  formProviderProps: any;
} & FormHTMLAttributes<HTMLFormElement>;

const Form: React.FC<FormProps> = ({
  children,
  formProviderProps,
  ...formProps
}) => (
  <FormProvider {...formProviderProps}>
    <form className="space-y-5 my-3" {...formProps}>
      {children}
    </form>
  </FormProvider>
);

export default Form;
