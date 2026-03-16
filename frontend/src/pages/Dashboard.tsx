export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Card 1</h2>
          <p className="text-gray-600 dark:text-gray-300">Dashboard content goes here</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Card 2</h2>
          <p className="text-gray-600 dark:text-gray-300">Add your widgets and data</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Card 3</h2>
          <p className="text-gray-600 dark:text-gray-300">Customize as needed</p>
        </div>
      </div>
    </div>
  )
}
