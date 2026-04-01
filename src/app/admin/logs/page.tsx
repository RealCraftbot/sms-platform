"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Category {
  id: string
  name: string
}

export default function LogsUploadPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null)

  useEffect(() => {
    // Fetch categories from logs API
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || [])
        if (data.categories?.length > 0) {
          setSelectedCategory(data.categories[0].id)
        }
      })
  }, [])

  const handleUpload = async () => {
    if (!file || !selectedCategory) return
    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("categoryId", selectedCategory)
      formData.append("file", file)

      const res = await fetch("/api/admin/logs/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Upload failed")
        setUploading(false)
        return
      }

      setResult({ success: true, count: data.count })
      setFile(null)
    } catch (err) {
      alert("Something went wrong")
    }

    setUploading(false)
  }

  const createCategory = async () => {
    const name = prompt("Enter category name:")
    if (!name) return

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }),
      })

      if (res.ok) {
        // Refresh categories
        fetch("/api/logs")
          .then(res => res.json())
          .then(data => setCategories(data.categories || []))
      }
    } catch (err) {
      alert("Failed to create category")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Social Logs</h1>
        <p className="text-muted-foreground">Bulk upload social media accounts via CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: platform, username, password, email, age, followers, price, costPrice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <p>platform,username,password,email,age,followers,price,costPrice</p>
            <p>Instagram,user1,pass123,user1@gmail.com,2,500,2500,1000</p>
            <p>Facebook,user2,pass456,user2@yahoo.com,1,1000,3000,1200</p>
            <p>Twitter,user3,pass789,,3,2000,4000,1500</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={createCategory}>Add Category</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>CSV File</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || !selectedCategory || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Logs"}
          </Button>
          {result && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
              Successfully uploaded {result.count} logs!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}