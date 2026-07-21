import { CommonActions, StackActions } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

let navigator: any;
let isNavReady = false;

// Queue navigation actions fired before NavigationContainer is ready (cold start race).
// This prevents "Cannot read property 'dispatch' of undefined" crashes on first open.
const pendingActions: any[] = [];
const MAX_PENDING_ACTIONS = 0;

function enqueueAction(action: any) {
  pendingActions.push(action);
  // Keep the queue bounded (oldest dropped)
  if (pendingActions.length > MAX_PENDING_ACTIONS) {
    pendingActions.splice(0, pendingActions.length - MAX_PENDING_ACTIONS);
  }
}

function flushPending() {
  if (!isNavReady || !navigator?.dispatch) {
    console.log('[NavigationService] Cannot flush pending actions - navigation not ready');
    return;
  }
  while (pendingActions.length) {
    const action = pendingActions.shift();
    try {
      navigator.dispatch(action);
    } catch (error) {
      // If something still fails, drop the action (do not crash the app)
      console.warn('[NavigationService] Failed to dispatch queued action:', error);
    }
  }
}

function setTopLevelNavigator(navigatorRef: any) {
  console.log('[NavigationService] Setting navigator ref', { hasRef: !!navigatorRef });
  navigator = navigatorRef;
  // If navigator was null/undefined and now we have a ref, try to flush
  if (navigatorRef) {
    flushPending();
  }
}

function setIsReady(ready: boolean) {
  console.log('[NavigationService] Setting navigation ready state:', ready);
  isNavReady = ready;
  if (ready) {
    flushPending();
  }
}

function safeDispatch(action: any) {
  // Enhanced safety checks for app resume scenarios
  if (!navigator) {
    console.warn('[NavigationService] Navigator ref is null, enqueueing action');
    enqueueAction(action);
    return;
  }

  if (!isNavReady) {
    console.warn('[NavigationService] Navigation not ready yet, enqueueing action');
    enqueueAction(action);
    return;
  }

  if (typeof navigator.dispatch !== 'function') {
    console.warn('[NavigationService] Navigator dispatch is not a function, enqueueing action');
    enqueueAction(action);
    return;
  }

  try {
    navigator.dispatch(action);
    return;
  } catch (error) {
    console.error('[NavigationService] Dispatch failed, enqueueing action:', error);
    // fall through to enqueue
    enqueueAction(action);
  }
}

function navigate(routeName: string, params?: object) {
  safeDispatch(
    CommonActions.navigate({
      name: routeName,
      params: params,
    }),
  );
}
function pop(n = 1) {
  safeDispatch(StackActions.pop(n));
}
function push(routeName: string) {
  safeDispatch(StackActions.push(routeName));
}
function reset(route: string) {
  safeDispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: route }],
    }),
  );
}

function resetStack(routes: Array<{ name: string; params?: object }>, index = routes.length - 1) {
  safeDispatch(
    CommonActions.reset({
      index,
      routes,
    }),
  );
}

function goBack() {
  safeDispatch(CommonActions.goBack());
  // navigator._navigation.goBack();
}
function openDrawer() {
  safeDispatch(DrawerActions.openDrawer());
}
function closeDrawer() {
  safeDispatch(DrawerActions.closeDrawer());
}

function replace(routeName: string, params?: object) {
  safeDispatch(StackActions.replace(routeName, params));
}
// add other navigation functions that you need and export them

function isNavigationReady(): boolean {
  const ready = isNavReady && navigator?.dispatch !== undefined;
  if (!ready) {
    console.log('[NavigationService] Navigation not ready:', {
      isNavReady,
      hasNavigator: !!navigator,
      hasDispatch: !!navigator?.dispatch,
    });
  }
  return ready;
}

function getCurrentRouteName(): string | undefined {
  try {
    return navigator?.getCurrentRoute?.()?.name;
  } catch {
    return undefined;
  }
}

export default {
  goBack,
  navigate,
  setTopLevelNavigator,
  setIsReady,
  openDrawer,
  closeDrawer,
  pop,
  reset,
  resetStack,
  push,
  replace,
  isNavigationReady,
  getCurrentRouteName,
};
