export {};
function mixin() {
  return { method(): number { return 1; } };
}
interface Base extends ReturnType<typeof mixin> {}
declare class Base {}
class Derived extends Base {
  override method(): number { return 2; }
}
