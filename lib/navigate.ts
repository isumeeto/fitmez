import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function transitionNavigate(router: AppRouterInstance, href: string) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
      router.push(href);
    });
  } else {
    router.push(href);
  }
}
