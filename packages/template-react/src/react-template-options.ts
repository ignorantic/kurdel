/**
 * ReactTemplateOptions
 *
 * Configuration options for the {@link ReactTemplateEngine}.
 *
 * Defines how and where the engine should locate and render
 * React-based server-side templates.
 */
export interface ReactTemplateOptions {
  /**
   * Absolute or relative path to the directory
   * containing your React views and `document.js` layout.
   *
   * @example
   * ```ts
   * {
   *   baseDir: resolve(__dirname, './views')
   * }
   * ```
   */
  baseDir: string;

  /**
   * Optional flag to disable wrapping each view
   * inside the shared `Document` component.
   *
   * When set to `false`, the engine will render
   * only the view itself (useful for fragments or APIs).
   *
   * @default true
   */
  withDocument?: boolean;

  /**
   * Optional flag to enable React strict mode
   * during server-side rendering.
   *
   * When enabled, the engine will wrap rendered content
   * with `<React.StrictMode>` to help detect unsafe patterns.
   *
   * @default false
   */
  strictMode?: boolean;
}
