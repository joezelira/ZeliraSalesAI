import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [googleSheetsId, setGoogleSheetsId] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [autoQualification, setAutoQualification] = useState(true);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure your AI sales assistant
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="integrations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Sheets Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sheets-id">Spreadsheet ID</Label>
                    <Input
                      id="sheets-id"
                      placeholder="Enter your Google Sheets ID"
                      value={googleSheetsId}
                      onChange={(e) => setGoogleSheetsId(e.target.value)}
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Found in your Google Sheets URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="sheets-range">Data Range</Label>
                    <Input
                      id="sheets-range"
                      placeholder="Sheet1!A:F"
                      defaultValue="Sheet1!A:F"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="sheets-monitoring" defaultChecked />
                    <Label htmlFor="sheets-monitoring">Enable real-time monitoring</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CRM Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connect to your CRM system to sync lead data and activities.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" disabled>
                      HubSpot
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </Button>
                    <Button variant="outline" disabled>
                      Salesforce
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </Button>
                    <Button variant="outline" disabled>
                      Pipedrive
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="email-enabled" 
                      checked={emailEnabled}
                      onCheckedChange={setEmailEnabled}
                    />
                    <Label htmlFor="email-enabled">Enable automatic email sending</Label>
                  </div>

                  <div>
                    <Label htmlFor="from-name">From Name</Label>
                    <Input
                      id="from-name"
                      placeholder="Sophie - Zelira.ai"
                      defaultValue="Sophie - Zelira.ai"
                    />
                  </div>

                  <div>
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      placeholder="sophie@zelira.ai"
                      defaultValue="sophie@zelira.ai"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-signature">Email Signature</Label>
                    <Textarea
                      id="email-signature"
                      placeholder="Best regards,&#10;Sophie&#10;AI Sales Assistant&#10;Zelira.ai"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Manage your email templates for different scenarios.
                  </p>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Welcome Email Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Follow-up Email Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Qualification Email Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto-qualification" 
                      checked={autoQualification}
                      onCheckedChange={setAutoQualification}
                    />
                    <Label htmlFor="auto-qualification">Enable automatic lead qualification</Label>
                  </div>

                  <div>
                    <Label htmlFor="qualification-threshold">Qualification Score Threshold</Label>
                    <Input
                      id="qualification-threshold"
                      type="number"
                      placeholder="70"
                      min="0"
                      max="100"
                      defaultValue="70"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Leads with scores above this threshold will be marked as qualified.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Input
                      id="ai-model"
                      value="gpt-4o"
                      disabled
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Using the latest OpenAI model for best performance.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualification Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="qualification-prompt">Custom Qualification Prompt</Label>
                    <Textarea
                      id="qualification-prompt"
                      placeholder="Enter custom criteria for lead qualification..."
                      rows={6}
                      defaultValue="Evaluate leads based on: Budget (can afford $5,000+ monthly), Authority (decision maker), Need (clear pain points), Timeline (within 6 months)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-new-leads" defaultChecked />
                      <Label htmlFor="notify-new-leads">New leads detected</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-qualified" defaultChecked />
                      <Label htmlFor="notify-qualified">Lead qualified</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-responses" defaultChecked />
                      <Label htmlFor="notify-responses">Email responses received</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-errors" defaultChecked />
                      <Label htmlFor="notify-errors">System errors</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="daily-summary" defaultChecked />
                    <Label htmlFor="daily-summary">Send daily summary email</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="summary-time">Summary Time</Label>
                    <Input
                      id="summary-time"
                      type="time"
                      defaultValue="09:00"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
