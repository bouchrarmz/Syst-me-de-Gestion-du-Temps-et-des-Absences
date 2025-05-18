import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Globe, Lock, Moon, Shield, Sun, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/contexts/PreferencesContext";

const fontOptions = [
  { value: "Roboto", label: "Roboto" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Verdana", label: "Verdana" },
  { value: "sans-serif", label: "Sans-serif" }
];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { preferences, setTheme, setFontFamily, setLanguage } = usePreferences();
  
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    system: true,
    absences: true,
    updates: false
  });

  useEffect(() => {
    i18n.changeLanguage(preferences.language);
    if (preferences.language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [preferences.language, i18n]);

  const handleDarkModeChange = () => {
    const newTheme = preferences.theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    toast.success(
      newTheme === "dark" 
        ? t("settings.darkModeActivated") 
        : t("settings.lightModeActivated")
    );
  };

  const handleNotificationSave = () => {
    toast.success(t("settings.notificationsSaved"), {
      description: t("settings.notificationsUpdated")
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new !== passwordData.confirm) {
      toast.error(t("settings.passwordsDoNotMatch"), {
        description: t("settings.confirmPassword")
      });
      return;
    }
    
    toast.success(t("settings.passwordChanged"), {
      description: t("settings.passwordUpdated")
    });
    
    setPasswordData({
      current: "",
      new: "",
      confirm: ""
    });
  };

  const handleLanguageChange = (value: "fr" | "en" | "ar") => {
    setLanguage(value);
    
    const languageNames = {
      fr: "Français",
      ar: "العربية (Arabe)",
      en: "English (Anglais)"
    };
    
    toast.success(`${t("settings.languageChanged")} ${languageNames[value]}`, {
      description: t("settings.refreshNeeded")
    });
  };

  const handleFontFamilyChange = (value: any) => {
    setFontFamily(value);
    toast.success(t("settings.fontChanged"), {
      description: t("settings.fontApplied")
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.notifications")}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.security")}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.language")}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.general")}</CardTitle>
              <CardDescription>
                {t("settings.generalDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-mode">{t("settings.theme")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {preferences.theme === "dark" 
                      ? t("settings.switchToLightMode") 
                      : t("settings.switchToDarkMode")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    id="theme-mode"
                    checked={preferences.theme === "dark"}
                    onCheckedChange={handleDarkModeChange}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop-notifications">{t("settings.desktopNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.showDesktopNotifications")}
                  </p>
                </div>
                <Switch
                  id="desktop-notifications"
                  defaultChecked
                />
              </div>
              
              <div>
                <Label>{t("settings.fontSize")}</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-full sm:w-[200px] mt-1.5">
                    <SelectValue placeholder={t("settings.selectFontSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t("settings.small")}</SelectItem>
                    <SelectItem value="medium">{t("settings.medium")}</SelectItem>
                    <SelectItem value="large">{t("settings.large")}</SelectItem>
                    <SelectItem value="xlarge">{t("settings.veryLarge")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t("settings.fontFamily")}</Label>
                <Select 
                  value={preferences.fontFamily} 
                  onValueChange={handleFontFamilyChange}
                >
                  <SelectTrigger className="w-full sm:w-[200px] mt-1.5">
                    <SelectValue placeholder={t("settings.selectFont")} />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t("settings.fontExample")}</Label>
                <p className="mt-2 p-4 rounded-md border" style={{ fontFamily: preferences.fontFamily }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-[#33C3F0] hover:bg-[#33C3F0]/90 dark:bg-[#6E59A5] dark:hover:bg-[#6E59A5]/90" onClick={() => toast.success(t("settings.generalSettingsSaved"))}>
                {t("general.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {t("settings.notificationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">{t("settings.emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.emailNotificationsDescription")}
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-notifications">{t("settings.systemNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.systemNotificationsDescription")}
                  </p>
                </div>
                <Switch
                  id="system-notifications"
                  checked={notifications.system}
                  onCheckedChange={(checked) => setNotifications({...notifications, system: checked})}
                />
              </div>
              
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="absence-notifications">{t("settings.absenceAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.absenceAlertsDescription")}
                  </p>
                </div>
                <Switch
                  id="absence-notifications"
                  checked={notifications.absences}
                  onCheckedChange={(checked) => setNotifications({...notifications, absences: checked})}
                />
              </div>
              
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="update-notifications">{t("settings.systemUpdates")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.systemUpdatesDescription")}
                  </p>
                </div>
                <Switch
                  id="update-notifications"
                  checked={notifications.updates}
                  onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-[#33C3F0] hover:bg-[#33C3F0]/90 dark:bg-[#6E59A5] dark:hover:bg-[#6E59A5]/90" onClick={handleNotificationSave}>
                {t("general.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security")}</CardTitle>
              <CardDescription>
                {t("settings.securityDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={passwordData.current}
                    onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={passwordData.new}
                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={passwordData.confirm}
                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex flex-row items-center justify-between mt-6">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">{t("settings.twoFactorAuth")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.twoFactorAuthDescription")}
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    defaultChecked={false}
                  />
                </div>
                
                <Button type="submit" className="mt-4 bg-[#33C3F0] hover:bg-[#33C3F0]/90 dark:bg-[#6E59A5] dark:hover:bg-[#6E59A5]/90">
                  <Lock className="mr-2 h-4 w-4" />
                  {t("settings.changePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>
                {t("settings.languageDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language-select">{t("settings.language")}</Label>
                <Select value={preferences.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select" className="w-full sm:w-[200px] mt-1.5">
                    <SelectValue placeholder={t("settings.selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">العربية (Arabe)</SelectItem>
                    <SelectItem value="en">English (Anglais)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-format">{t("settings.dateFormat")}</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger id="date-format" className="w-full sm:w-[200px] mt-1.5">
                    <SelectValue placeholder={t("settings.dateFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">JJ/MM/AAAA</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/JJ/AAAA</SelectItem>
                    <SelectItem value="yyyy-mm-dd">AAAA-MM-JJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="feedback">{t("settings.translationFeedback")}</Label>
                <Textarea 
                  id="feedback" 
                  placeholder={t("settings.translationFeedbackPlaceholder")}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-[#33C3F0] hover:bg-[#33C3F0]/90 dark:bg-[#6E59A5] dark:hover:bg-[#6E59A5]/90" onClick={() => toast.success(t("settings.languageSettingsSaved"))}>
                <Check className="mr-2 h-4 w-4" />
                {t("general.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
