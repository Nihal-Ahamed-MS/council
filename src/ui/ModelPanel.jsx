import React from 'react';
import { Box, Text, useInput } from 'ink';

export function ModelPanel({ model, tokens, error, isStreaming, isFocused, width }) {
  const SCROLL_STEP = 3;
  
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const lines = React.useMemo(() => {
    const text = tokens.join('');
    const wrapped = [];
    const innerWidth = Math.max(1, (width ?? 40) - 4);
    for (const rawLine of text.split('\n')) {
      if (rawLine.length === 0) {
        wrapped.push('');
      } else {
        for (let i = 0; i < rawLine.length; i += innerWidth) {
          wrapped.push(rawLine.slice(i, i + innerWidth));
        }
      }
    }
    return wrapped;
  }, [tokens, width]);

  const visibleRows = 20;
  const maxScroll = Math.max(0, lines.length - visibleRows);
  const visible = lines.slice(scrollOffset, scrollOffset + visibleRows);

  React.useEffect(() => {
    if (isStreaming) setScrollOffset(maxScroll);
  }, [lines.length, isStreaming, maxScroll]);

  useInput((_, key) => {
    if (!isFocused) return;
    if (key.upArrow) setScrollOffset((s) => Math.max(0, s - SCROLL_STEP));
    if (key.downArrow) setScrollOffset((s) => Math.min(maxScroll, s + SCROLL_STEP));
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      width={width}
      flexShrink={0}
      borderColor={isFocused ? 'cyan' : 'gray'}
    >
      {/* Header */}
      <Box paddingX={1} justifyContent="space-between">
        <Text bold color={isFocused ? 'cyan' : 'white'}>
          {model.label}
        </Text>
        <Text color="gray" dimColor>
          {error
            ? `error: ${error}`
            : isStreaming
              ? 'streaming...'
              : tokens.length === 0
                ? 'waiting...'
                : `${lines.length} lines`}
        </Text>
      </Box>

      {/* Content */}
      <Box flexDirection="column" paddingX={1} flexGrow={1} overflow="hidden">
        {!model.available ? (
          <Text color="gray" dimColor>
            unavailable
            {model.id.startsWith('ollama/') ? ' — needs Docker' : ''}
          </Text>
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : visible.length === 0 ? (
          <Text color="gray" dimColor>
            —
          </Text>
        ) : (
          visible.map((line, i) => (
            <Text key={i + scrollOffset} wrap="truncate">
              {line || ' '}
            </Text>
          ))
        )}
      </Box>

      {lines.length > visibleRows && (
        <Box paddingX={1} justifyContent="flex-end">
          <Text color="gray" dimColor>
            {scrollOffset + 1}–{Math.min(scrollOffset + visibleRows, lines.length)}/{lines.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}
