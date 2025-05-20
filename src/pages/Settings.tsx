
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { PlanUpgrade } from "@/components/settings/PlanUpgrade";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { useAuth, useFinance } from "@/contexts";
import { UserProfileSection } from "@/components/settings/UserProfileSection";

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { userSettings, refetchUserSettings } = useFinance();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync the darkMode state with the theme context
  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    
    // Refetch user settings to ensure we have the latest data
    refetchUserSettings();
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  // Handler for dark mode toggle
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    toggleTheme();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="plan">Plano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="mt-6">
          <Card className="shadow-sm max-w-3xl">
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize sua experiência no aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Tema escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar modo escuro para reduzir o cansaço visual
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleDarkModeChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas sobre transações e lembretes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <UserProfileSection />
        </TabsContent>
        
        <TabsContent value="plan" className="mt-6">
          <PlanUpgrade />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
