"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

export default function LogsUploadPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")
    
    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    const headers: Record<string, string> = { "x-admin-id": adminId }
    
    fetch("/api/logs", { headers })
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || [])
        if (data.categories?.length > 0) {
          setSelectedCategory(data.categories[0].id)
        }
      })
  }, [mounted, router])

  const handleUpload = async () => {
    if (!file || !selectedCategory) return
    setUploading(true)
    setResult(null)

    const adminId = localStorage.getItem("adminId")

    try {
      const formData = new FormData()
      formData.append("categoryId", selectedCategory)
      formData.append("file", file)

      const res = await fetch("/api/admin/logs/upload", {
        method: "POST",
        headers: { "x-admin-id": adminId || "" },
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
    } catch {
      alert("Something went wrong")
    }

    setUploading(false)
  }

  const createCategory = async () => {
    const name = prompt("Enter category name:")
    if (!name) return

    const adminId = localStorage.getItem("adminId")
    
    try {
      const res = await fetch("/api/logs/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-id": adminId || ""
        },
        body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }),
      })

      if (res.ok) {
        const data = await res.json()
        setCategories(prev => [...prev, { id: data.id, name }])
        setSelectedCategory(data.id)
      }
    } catch {
      alert("Failed to create category")
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
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