export default function DashboardLayout({ children }) {
    return (
      <main className="min-h-screen bg-[#f9f9fb] p-6 font-sans text-gray-800">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    )
  }