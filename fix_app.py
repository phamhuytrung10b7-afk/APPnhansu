with open('App.tsx', 'r') as f:
    app_ts = f.read()

# Add loading state and initialize call
if "isInitializing" not in app_ts:
    app_ts = app_ts.replace("export default function App() {", "export default function App() {\n  const [isInitializing, setIsInitializing] = useState(true);")
    
    init_effect = """  useEffect(() => {
    const initDB = async () => {
      await storageService.initialize();
      refreshData();
      setIsInitializing(false);
    };
    initDB();
  }, [refreshData]);"""
    
    app_ts = app_ts.replace("  useEffect(() => {\n    refreshData();\n  }, [refreshData]);", init_effect)
    
    render = """  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center bg-slate-100 text-emerald-800 font-bold">Đang tải dữ liệu từ Supabase...</div>;
  }

  return ("""
    app_ts = app_ts.replace("  return (\n    <div className=\"flex h-screen", render + "\n    <div className=\"flex h-screen")

with open('App.tsx', 'w') as f:
    f.write(app_ts)
