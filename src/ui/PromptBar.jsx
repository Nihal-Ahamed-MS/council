import React from 'react';
import { Box, Text, useInput } from 'ink';

export function PromptBar({ onSubmit, disabled }) {
  const [value, setValue] = React.useState('');

  useInput((input, key) => {
    if (disabled) return;

    if (key.return) {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
      return;
    }

    if (key.ctrl || key.meta) return;

    if (input) {
      setValue((v) => v + input);
    }
  });

  return (
    <Box borderStyle="single" borderColor={disabled ? 'gray' : 'cyan'} paddingX={1}>
      <Text color="cyan" bold>
        {'> '}
      </Text>
      <Text>{value}</Text>
      {!disabled && <Text color="cyan">█</Text>}
    </Box>
  );
}
