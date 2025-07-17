"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"

export function ImportExportView() {
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    errors: number
    duplicates: number
  } | null>(null)

  const handleImport = () => {
    setIsImporting(true)
    setImportProgress(0)

    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          setImportResults({
            total: 1250,
            success: 1180,
            errors: 15,
            duplicates: 55,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleExport = () => {
    // Simulate export
    alert("Export started! You will receive a download link shortly.")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import & Export</h1>
        <p className="text-gray-600 mt-1">Manage bulk contact data operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Import Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="import-file">Select CSV/Excel File</Label>
              <Input id="import-file" type="file" accept=".csv,.xlsx,.xls" />
              <p className="text-xs text-gray-500 mt-1">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing contacts...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            {importResults && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Import Complete
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total Processed: {importResults.total}</div>
                  <div className="text-green-600">Successful: {importResults.success}</div>
                  <div className="text-red-600">Errors: {importResults.errors}</div>
                  <div className="text-yellow-600">Duplicates: {importResults.duplicates}</div>
                </div>
              </div>
            )}

            <Button onClick={handleImport} disabled={isImporting} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : "Import Contacts"}
            </Button>

            <div className="text-xs text-gray-500">
              <p>• Ensure your file has columns: Name, Company, Email, Phone</p>
              <p>• Duplicates will be automatically detected and skipped</p>
              <p>• Maximum file size: 10MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Export Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Export All Contacts (CSV)
              </Button>
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Export Assigned Contacts Only
              </Button>
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Export Unassigned Contacts
              </Button>
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Export with Contact History
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>• Exports include all contact details and interaction history</p>
              <p>• Files are generated in CSV format for easy import elsewhere</p>
              <p>• Large exports may take a few minutes to process</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Import completed</p>
                  <p className="text-sm text-gray-600">1,180 contacts imported successfully</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Export completed</p>
                  <p className="text-sm text-gray-600">All contacts exported to CSV</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Import with warnings</p>
                  <p className="text-sm text-gray-600">55 duplicates found and skipped</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
