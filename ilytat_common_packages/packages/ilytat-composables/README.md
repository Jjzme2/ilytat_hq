# @ilytat/composables

Shared Vue composables for ILYTAT applications.

## Installation

```bash
npm install @ilytat/composables
```

## Usage

### `useDevice`

Reactive device detection utility.

```ts
import { useDevice } from '@ilytat/composables';

const { isMobile, isTablet, isDesktop, isTouch, isSSR } = useDevice();
```

### `useEventListener`

Lifecycle-aware event listener. Automatically removes the listener when the component is unmounted.

```ts
import { useEventListener } from '@ilytat/composables';

useEventListener(window, 'resize', () => {
  console.log('Window resized');
});

// Or with a ref
const el = ref<HTMLElement | null>(null);
useEventListener(el, 'click', () => {
  console.log('Element clicked');
});
```

### `useMounted`

SSR-safe mounted state.

```ts
import { useMounted } from '@ilytat/composables';

const isMounted = useMounted();

if (isMounted.value) {
  // Client-side only logic
}
```
