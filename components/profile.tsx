"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  User, Mail, Phone, MapPin, Calendar, Weight, Ruler, Save,
} from "lucide-react"

export function Profile() {
  const [userData, setUserData] = useState({
    first_name: "",
    email: "",
    phone_number: "",
    location: "",
    date_of_birth: "",
    gender: "",
    bio: ""
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          const errorData = await res.json()
          setError(errorData.error || `Error: ${res.statusText}`)
          console.error(`Error: ${res.statusText}`)
          return
        }

        const data = await res.json()
        setUserData({
          first_name: data.first_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          location: data.location || "",
          date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : "",
          gender: data.gender || "",
          bio: data.bio || ""
        })
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setError("Failed to fetch user data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(data.message || "Profile updated successfully")
        setIsEditing(false)

        // Update userData with the returned user data if available
        if (data.user) {
          setUserData({
            first_name: data.user.first_name || userData.first_name,
            email: data.user.email || userData.email,
            phone_number: data.user.phone_number || userData.phone_number,
            location: data.user.location || userData.location,
            date_of_birth: data.user.date_of_birth ?
              (typeof data.user.date_of_birth === 'string' ? data.user.date_of_birth.slice(0, 10) : data.user.date_of_birth)
              : userData.date_of_birth,
            gender: data.user.gender || userData.gender,
            bio: data.user.bio || userData.bio
          })
        }
      } else {
        const errorData = await res.json()
        setError(errorData.error || `Error: ${res.statusText}`)
        console.error("Error updating profile:", res.statusText)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setUserData((prevState) => ({
      ...prevState,
      [id]: value,
    }))
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{success}</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile picture" />
                    <AvatarFallback>{userData.first_name ? userData.first_name.charAt(0) : "U"}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
                <div className="grid gap-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="first_name"
                          value={userData.first_name}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={userData.email}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone_number"
                          value={userData.phone_number}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={userData.location}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={userData.date_of_birth}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="gender"
                          value={userData.gender}
                          onChange={handleChange}
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={userData.bio}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                  </div>

                  {isEditing ? (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className={loading ? "opacity-70" : ""}
                      >
                        {loading ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Physical Information</CardTitle>
              <CardDescription>Update your physical measurements for accurate tracking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <Input id="weight" defaultValue="75.5" />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <Input id="height" defaultValue="180" />
                    <span className="text-sm text-muted-foreground">cm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI</Label>
                  <div className="flex items-center gap-2">
                    <Input id="bmi" defaultValue="23.3" disabled />
                    <span className="text-sm text-muted-foreground">kg/m²</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>Set and track your fitness goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Goals and progress tracking will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Account settings will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
