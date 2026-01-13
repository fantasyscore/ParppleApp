import { CommonActions, StackActions } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

let navigator: any;
let isNavReady = false;

// Queue navigation actions fired before NavigationContainer is ready (cold start race).
// This prevents "Cannot read property 'dispatch' of undefined" crashes on first open.
const pendingActions: any[] = [];
const MAX_PENDING_ACTIONS = 20;

function enqueueAction(action: any) {
  pendingActions.push(action);
  // Keep the queue bounded (oldest dropped)
  if (pendingActions.length > MAX_PENDING_ACTIONS) {
    pendingActions.splice(0, pendingActions.length - MAX_PENDING_ACTIONS);
  }
}

function flushPending() {
  if (!isNavReady || !navigator?.dispatch) return;
  while (pendingActions.length) {
    const action = pendingActions.shift();
    try {
      navigator.dispatch(action);
    } catch {
      // If something still fails, drop the action (do not crash the app)
    }
  }
}

function setTopLevelNavigator(navigatorRef: any) {
  navigator = navigatorRef;
  flushPending();
}

function setIsReady(ready: boolean) {
  isNavReady = ready;
  flushPending();
}

function safeDispatch(action: any) {
  if (isNavReady && navigator?.dispatch) {
    try {
      navigator.dispatch(action);
      return;
    } catch {
      // fall through to enqueue
    }
  }
  enqueueAction(action);
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
  return isNavReady && navigator?.dispatch !== undefined;
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
};
