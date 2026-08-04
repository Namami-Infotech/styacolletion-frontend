import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { EmployeeRoute } from '../routes/auth/login.route.js';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = Cookies.get('user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user session cookie:', e);
        return null;
      }
    }
    return null;
  });

  const [roleInfo, setRoleInfo] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const fetchedRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchPermissions = useCallback(async (force = false) => {
    const now = Date.now();
    // Prevent redundant network calls if already fetched unless forced
    if (fetchedRef.current && !force) return;
    // Throttling guard: Minimum 60s gap for background auto-syncs (5s minimum for manual force)
    if (lastFetchTimeRef.current && (now - lastFetchTimeRef.current < (force ? 5000 : 60000))) {
      return;
    }

    fetchedRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      setLoadingPermissions(true);
      const res = await EmployeeRoute.getPermissions();
      if (res && res.success && res.data) {
        setRoleInfo({
          id: res.data.id,
          name: res.data.name,
          slug: res.data.slug,
          status: res.data.status,
          role_custom_id: res.data.role_custom_id,
        });
        let permData = res.data.permission || {};
        while (permData && permData.permission && typeof permData.permission === 'object') {
          permData = permData.permission;
        }
        setPermissions(permData);
        return res.data;
      } else {
        setPermissions({});
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions({});
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      Cookies.set('accessToken', token, { expires: 1, path: '/' });
    }
    Cookies.set('user_session', JSON.stringify(userData), { expires: 1, path: '/' });
    fetchedRef.current = false;
    lastFetchTimeRef.current = 0;
    fetchPermissions(true);
    return userData;
  };

  const logout = async () => {
    try {
      const result = await EmployeeRoute.logout();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Failed to logout on server:', err);
      toast.error('Failed to logout');
    } finally {
      setUser(null);
      setRoleInfo(null);
      setPermissions(null);
      fetchedRef.current = false;
      lastFetchTimeRef.current = 0;
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('user_session', { path: '/' });
    }
  };

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchPermissions();
    }
  }, [user, fetchPermissions]);

  // Smart background auto-sync when tab regains focus or becomes visible (with 60s cooldown protection)
  useEffect(() => {
    if (!user) return;

    const handleFocusSync = () => {
      fetchPermissions(true);
    };

    window.addEventListener('focus', handleFocusSync);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocusSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, fetchPermissions]);

  const hasPermission = useCallback(
    (moduleName, actionName, subModuleName) => {
      if (!permissions) return false;

      let actualPerms = permissions;
      while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
        actualPerms = actualPerms.permission;
      }

      if (!moduleName) return true;

      const lowerModule = moduleName.toLowerCase();

      const normalizeActionKeys = (act) => {
        if (!act) return [];
        const lowerAct = act.toLowerCase();
        if (lowerAct === 'create' || lowerAct === 'add') return ['add', 'create'];
        if (lowerAct === 'edit' || lowerAct === 'update') return ['edit', 'update'];
        if (lowerAct === 'delete' || lowerAct === 'remove') return ['delete', 'remove'];
        if (lowerAct === 'view' || lowerAct === 'read') return ['allView', 'ownView', 'view', 'read'];
        if (lowerAct === 'allview') return ['allView', 'view', 'read'];
        if (lowerAct === 'ownview') return ['ownView', 'view', 'read'];
        return [act, lowerAct];
      };

      const checkActionOnNode = (node, act) => {
        if (!node || typeof node !== 'object') return false;
        if (!act) {
          return Object.values(node).some((val) => {
            if (typeof val === 'boolean') return val;
            if (typeof val === 'object' && val !== null) return checkActionOnNode(val, null);
            return false;
          });
        }

        const validKeys = normalizeActionKeys(act);
        for (const k of Object.keys(node)) {
          if (validKeys.some((vk) => vk.toLowerCase() === k.toLowerCase())) {
            if (node[k] === true) return true;
          }
        }
        return false;
      };

      // 1. Find top-level module match
      const topMatchKey = Object.keys(actualPerms).find((k) => {
        const lk = k.toLowerCase();
        return (
          lk === lowerModule ||
          (lowerModule === 'employees' && lk === 'employee') ||
          (lowerModule === 'employee' && lk === 'employees') ||
          (lowerModule === 'roles' && lk === 'role') ||
          (lowerModule === 'role' && lk === 'roles') ||
          (lowerModule === 'office' && lk === 'branch') ||
          (lowerModule === 'branch' && lk === 'office')
        );
      });

      let targetModule = topMatchKey ? actualPerms[topMatchKey] : null;

      // 2. Search sub-modules if top-level module was not directly found
      if (!targetModule) {
        for (const pKey of Object.keys(actualPerms)) {
          const pVal = actualPerms[pKey];
          if (pVal && typeof pVal === 'object') {
            const subKeyMatch = Object.keys(pVal).find((sk) => sk.toLowerCase() === lowerModule);
            if (subKeyMatch) {
              targetModule = pVal[subKeyMatch];
              break;
            }
          }
        }
      }

      if (!targetModule) return false;

      // 3. Target specific sub-module if requested
      if (subModuleName && typeof targetModule === 'object') {
        const subMatchKey = Object.keys(targetModule).find((sk) => sk.toLowerCase() === subModuleName.toLowerCase());
        if (subMatchKey) {
          targetModule = targetModule[subMatchKey];
        } else {
          return false;
        }
      }

      // 4. Evaluate action permission
      if (targetModule && typeof targetModule === 'object') {
        if (checkActionOnNode(targetModule, actionName)) return true;

        return Object.values(targetModule).some((subVal) => {
          if (subVal && typeof subVal === 'object') {
            return checkActionOnNode(subVal, actionName);
          }
          return false;
        });
      }

      return false;
    },
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        roleInfo,
        permissions,
        loadingPermissions,
        fetchPermissions,
        hasPermission,
        login,
        logout,
        isAuthenticated: !!user && !!Cookies.get('accessToken'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
