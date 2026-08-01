with open('App.tsx', 'r') as f:
    app_ts = f.read()

app_ts = app_ts.replace(
    "import { storageService } from './storage';",
    "import { storageService } from './storage';\nimport { supabase } from './supabaseClient';"
)

realtime_code = """  useEffect(() => {
    const initDB = async () => {
      await storageService.initialize();
      refreshData();
      setIsInitializing(false);
    };
    initDB();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('public-tables')
      .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
        console.log('Realtime change detected:', payload);
        // Khi có thay đổi, tải lại toàn bộ data mới từ server và cập nhật UI
        await storageService.refreshFromServer();
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);"""

app_ts = app_ts.replace(
    "  useEffect(() => {\n    const initDB = async () => {\n      await storageService.initialize();\n      refreshData();\n      setIsInitializing(false);\n    };\n    initDB();\n  }, [refreshData]);",
    realtime_code
)

with open('App.tsx', 'w') as f:
    f.write(app_ts)
