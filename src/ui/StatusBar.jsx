import React from 'react';
import { Box, Text } from 'ink';

export function StatusBar({ mode, activeCount, totalCount }) {
  const modeLabel = mode === 'gateway' ? 'gateway mode' : 'sdk mode ⚠';
  const modeColor = mode === 'gateway' ? 'green' : 'yellow';

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Box gap={2}>
        <Text bold>[</Text>
        <Text color={modeColor} bold>
          {modeLabel}
        </Text>
        <Text bold>]</Text>
        <Text color="gray">
          {activeCount}/{totalCount} models active
        </Text>
      </Box>
      <Box gap={3}>
        <Text color="gray">^C quit</Text>
      </Box>
    </Box>
  );
}
