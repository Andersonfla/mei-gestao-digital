
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  activeTab: "login" | "signup";
  children: ReactNode;
  footerText: string;
}

export const AuthLayout = ({ activeTab, children, footerText }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
              alt="MEI Finanças" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">MEI Finanças</CardTitle>
          <CardDescription>Gerencie suas finanças de maneira simples e eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
          <p>{footerText}</p>
        </CardFooter>
      </Card>
    </div>
  );
};
