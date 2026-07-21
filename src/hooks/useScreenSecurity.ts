import { useEffect } from 'react';
import { enableScreenSecurity, disableScreenSecurity } from '../utils/ScreenSecurity';

/**
 * A hook to temporarily override the global screen security setting for a specific component.
 * @param enable If true, forces security ON while the component is mounted. If false, forces security OFF while the component is mounted.
 */
export const useScreenSecurity = (enable: boolean = true) => {
    useEffect(() => {
        if (enable) {
            enableScreenSecurity();
        } else {
            disableScreenSecurity();
        }

        return () => {
            // Restore global state (assuming global is always ON for this app)
            // If the global state was different, we'd need a context to manage it.
            // For now, if a component disables it, we re-enable it on unmount.
            if (!enable) {
                enableScreenSecurity();
            }
        };
    }, [enable]);
};
