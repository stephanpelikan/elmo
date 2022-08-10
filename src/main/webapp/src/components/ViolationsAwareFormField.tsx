import { FormField, FormFieldExtendedProps } from "grommet";
import { TFunction } from "react-i18next";

interface ViolationsAwareFormFieldProps extends FormFieldExtendedProps {
  violations: any;
  t: TFunction;
  label: string;
}

const ViolationsAwareFormField = ({
  violations,
  name,
  label,
  t,
  children = undefined,
  onChange = undefined,
  ...props
}: ViolationsAwareFormFieldProps) => (<FormField
      name={name}
      onChange={ value => {
          violations[name] = undefined;
          if (onChange) {
            onChange(value);
          }
        }
      }
      label={ t(label) }
      error={ t(violations[name] !== undefined ? label + '_' + violations[name] : undefined) }
      {...props}>{children}</FormField>);

export { ViolationsAwareFormField };
