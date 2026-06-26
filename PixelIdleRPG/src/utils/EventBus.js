class GameEventBus extends EventTarget {
  emit(type, detail = undefined) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
  on(type, handler, options) {
    const wrapped = event => handler(event.detail, event);
    this.addEventListener(type, wrapped, options);
    return () => this.removeEventListener(type, wrapped, options);
  }
}
export const bus = new GameEventBus();
