import { useCallback, useRef } from "react";

export default function useComposing() {
  const isComposingRef = useRef(false);

  const onCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback(() => {
    setTimeout(() => {
      isComposingRef.current = false;
    }, 50);
  }, []);

  return { isComposingRef, onCompositionStart, onCompositionEnd };
}
