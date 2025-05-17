
export const useFormValidation = () => {
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Validate login form
  const validateLoginForm = (email: string, password: string, setEmailError: (error: string) => void, setPasswordError: (error: string) => void): boolean => {
    let isValid = true;
    
    if (!email) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    return isValid;
  };
  
  // Validate signup form
  const validateSignupForm = (
    name: string, 
    email: string, 
    password: string, 
    passwordConfirm: string, 
    setNameError: (error: string) => void,
    setEmailError: (error: string) => void, 
    setPasswordError: (error: string) => void, 
    setPasswordConfirmError: (error: string) => void
  ): boolean => {
    let isValid = true;
    
    if (!name) {
      setNameError("Nome é obrigatório");
      isValid = false;
    } else {
      setNameError("");
    }
    
    if (!email) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    if (!passwordConfirm) {
      setPasswordConfirmError("Confirmação de senha é obrigatória");
      isValid = false;
    } else if (passwordConfirm !== password) {
      setPasswordConfirmError("As senhas não conferem");
      isValid = false;
    } else {
      setPasswordConfirmError("");
    }
    
    return isValid;
  };

  return {
    validateEmail,
    validateLoginForm,
    validateSignupForm
  };
};
