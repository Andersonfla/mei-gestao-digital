
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function UserProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        setIsLoading(true);
        
        try {
          // Get user profile data from the profiles table
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", user.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }
          
          // Set user data from the profile
          if (profileData) {
            setUserName(profileData.name || "");
            setEmail(profileData.email || user.email || "");
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar seus dados de perfil.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user?.id, toast, user?.email]);
  
  // Handle profile update
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    try {
      // Update the user's profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({ name: userName })
        .eq("id", user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus dados de perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="shadow-sm max-w-3xl">
      <CardHeader>
        <CardTitle>Seu Perfil</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Nome</Label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                readOnly
                disabled
              />
              <p className="text-sm text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfile} disabled={isLoading || isSaving}>
          {isSaving ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </CardFooter>
    </Card>
  );
}
