# Utility Types

This directory contains TypeScript utility types that enhance type safety across the application.

## Purpose

The utility types provided here help developers:

- Write type-safe code with less boilerplate
- Create more maintainable and readable type definitions
- Leverage advanced TypeScript features consistently
- Avoid common typing pitfalls

## Usage

Import utility types from the central index:

```typescript
import type { RequiredProps, Callback, Result } from '~/types'
```

## Available Utility Types

### Property Manipulation

- **`RequiredProps<T, K>`** - Make specific properties required
- **`OptionalExcept<T, K>`** - Make all properties optional except specified
- **`PropType<T, K>`** - Extract the type of a specific property

### Array and Collection Types

- **`ArrayElement<T>`** - Extract array element type
- **`ReadonlyRecord<K, V>`** - Create readonly records

### Event Handlers

- **`EventHandler<T, E>`** - Generic event handler type
- **`ChangeHandler<T>`** - onChange event handler
- **`ClickHandler<T>`** - onClick event handler

### Callback Types

- **`VoidCallback`** - Callback with no parameters
- **`Callback<T>`** - Callback with one parameter
- **`AsyncCallback<T>`** - Async callback type

### Utility Patterns

- **`ConfigBase`** - Base interface for configuration objects
- **`Result<T, E>`** - Result type for success/failure operations
- **`Nullable<T>`** - Type that can be null
- **`Maybe<T>`** - Type that can be null or undefined

### Deep Types

- **`DeepPartial<T>`** - Make all nested properties optional
- **`DeepReadonly<T>`** - Make all nested properties readonly

### Advanced Type Manipulation

- **`KeysOfType<T, V>`** - Extract keys of a specific value type
- **`PickByType<T, V>`** - Pick properties by their type
- **`OmitByType<T, V>`** - Omit properties by their type

## Examples

### Making Specific Properties Required

```typescript
type User = { name?: string; age?: number; id?: string }
type UserWithId = RequiredProps<User, 'id'>
// Result: { name?: string, age?: number, id: string }
```

### Extracting Array Element Type

```typescript
type Numbers = number[]
type NumberItem = ArrayElement<Numbers>
// Result: number
```

### Using Result Type

```typescript
async function fetchData(): Promise<Result<Data, Error>> {
  try {
    const data = await api.getData()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### Type-Safe Callbacks

```typescript
interface ComponentProps {
  onChange: Callback<string>
  onSubmit: VoidCallback
  onAsyncAction: AsyncCallback<number>
}
```

## Best Practices

1. **Use utility types to reduce boilerplate** - Instead of manually creating complex types, leverage existing utilities
2. **Be specific** - Choose the most specific utility type for your use case
3. **Document usage** - When using complex type compositions, add comments explaining the intent
4. **Prefer built-in types** - Use TypeScript's built-in utilities when possible
5. **Keep it simple** - Don't over-engineer types; use utilities to make code clearer, not more complex

## Contributing

When adding new utility types:

1. Add comprehensive JSDoc documentation with examples
2. Ensure the type works with strict TypeScript settings
3. Test the type with real-world use cases
4. Update this README with usage examples
