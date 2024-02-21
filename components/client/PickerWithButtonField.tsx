import * as React from 'react';
import Button from '@mui/material/Button';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { UseDateFieldProps } from '@mui/x-date-pickers/DateField';
import {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection,
} from '@mui/x-date-pickers/models';
import { Moment } from 'moment';
import { useState } from 'react';
import { PickersActionBar, PickersCalendarHeader } from '@mui/x-date-pickers';

interface ButtonFieldProps
  extends UseDateFieldProps<Moment>,
    BaseSingleInputFieldProps<
      Moment | null,
      Moment,
      FieldSection,
      DateValidationError
    > {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

function ButtonField(props: ButtonFieldProps) {
  const {
    setOpen,
    label,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { 'aria-label': ariaLabel } = {},
  } = props;

  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      ref={ref}
      aria-label={ariaLabel}
      size='small'
      onClick={() => setOpen?.((prev) => !prev)}
    >
      {label ? `${label}` : 'Pick a date'}
    </Button>
  );
}

function ButtonDatePicker(
  props: Omit<DatePickerProps<Moment>, 'open' | 'onOpen' | 'onClose'>,
) {
  const [open, setOpen] = React.useState(false);

  return (
    <DatePicker
      slots={{ field: ButtonField, ...props.slots }}
      slotProps={{ field: { setOpen } as any, toolbar: {
        toolbarFormat: props.format
      } }}
      {...props}
      format='DD, MMM, YYYY'
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

export default function PickerWithButtonField(
    props: {
      value: Moment,
      setValue: (value: Moment) => void;
      format?: string | undefined
    }
) {
  const {value, setValue, format='DD MMM, YYYY'} = props;
  const [locValue, setLocValue] = useState<Moment | null>(value);

  return (
    <ButtonDatePicker
      label={value == null ? null : value.format(format)}
      value={value}
      onChange={(newValue) => setLocValue(newValue)}
      onAccept={v => setValue && locValue && setValue(locValue)}
      format={format}
    />
  );
}
