import { useState } from "react";
import { User, Send, Shield, MessageCircle, Key, Check, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const handleSave = () => {
    toast({
      title: "Settings saved!",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleTestTelegram = () => {
    toast({
      title: "Test message sent",
      description: "Check your Telegram channel for the test message.",
    });
  };

  const handleTestWhatsApp = () => {
    toast({
      title: "Connection tested",
      description: "WhatsApp connection is working properly.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen relative">
        <Header title="Settings" subtitle="Manage your account and preferences" />
        
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            <TabsList className="h-12 bg-muted/50 p-1 mb-6">
              <TabsTrigger value="profile" className="gap-2 px-4">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="telegram" className="gap-2 px-4">
                <Send className="h-4 w-4" />
                Telegram
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 px-4">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="gap-2 px-4">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 px-4">
                <Key className="h-4 w-4" />
                API Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@dealsengine.ca" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." className="min-h-[100px]" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Telegram Tab */}
            <TabsContent value="telegram" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Telegram Integration</CardTitle>
                      <CardDescription>Send deals to your channel</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted gap-1.5">
                      <X className="h-3 w-3" />
                      Not Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Send className="h-5 w-5 text-primary" />
                      <span className="font-medium">Telegram Bot</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Send deals to your channel</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="botToken">Bot Token</Label>
                    <Input id="botToken" type="password" placeholder="Enter your Telegram bot token" className="h-11" />
                    <p className="text-xs text-muted-foreground">Get your bot token from @BotFather on Telegram</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="channelId">Channel/Chat ID</Label>
                    <Input id="channelId" placeholder="Enter your channel or chat ID" className="h-11" />
                    <p className="text-xs text-muted-foreground">Use @username for public channels or numeric ID for private chats</p>
                  </div>

                  <Button variant="outline" onClick={handleTestTelegram} className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Test Message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="Enter current password" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter new password" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="h-11" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>WhatsApp Integration</CardTitle>
                      <CardDescription>Send deals to WhatsApp groups</CardDescription>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30 gap-1.5">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">WhatsApp Connected</p>
                          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupId">Broadcast Group ID</Label>
                    <Input id="groupId" defaultValue="120363XXX@g.us" className="h-11" />
                  </div>

                  <Button variant="outline" onClick={handleTestWhatsApp} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings Tab */}
            <TabsContent value="api" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>Manage your API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input id="apiKey" type="password" defaultValue="sk-xxxx-xxxx-xxxx-xxxx" className="h-11 flex-1" readOnly />
                      <Button variant="outline" className="h-11">Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Use this key to authenticate API requests</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input id="webhookUrl" placeholder="https://your-domain.com/webhook" className="h-11" />
                    <p className="text-xs text-muted-foreground">Receive real-time notifications for new deals</p>
                  </div>

                  <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Regenerate API Key
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Button 
              onClick={handleSave}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Check className="h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
