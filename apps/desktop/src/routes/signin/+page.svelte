<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { goto } from "$app/navigation";
  import SignInForm from "./SignInForm.svelte";
  import VerificationForm from "./VerificationForm.svelte";

  const { signIn } = useAuth();
  const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isLoading = $derived(useAuth().isLoading);

  type Step =
    | "signIn"
    | "signUp"
    | { email: string; flow: "signUp-verification" };

  let step = $state<Step>("signIn");

  $effect(() => {
    if (isAuthenticated) {
      goto("/", { replaceState: true });
    }
  });

  function handleFormSubmit(formData: FormData) {
    if (step === "signUp") {
      if (formData.get("password") !== formData.get("confirmPassword")) {
        alert("Passwords do not match!");
        return;
      }
      const email = String(formData.get("email") ?? "");
      signIn("password", formData).then(() => {
        step = {
          email,
          flow: "signUp-verification",
        };
      });
    } else {
      signIn("password", formData);
    }
  }

  function handleVerificationSubmit(code: string) {
    if (typeof step === "object") {
      const formData = new FormData();
      formData.set("code", code);
      formData.set("email", step.email);
      formData.set("flow", "email-verification");
      signIn("password", formData);
      goto("/", { replaceState: true });
    }
  }
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    {#if typeof step === "object"}
      <VerificationForm
        email={step.email}
        {isLoading}
        onSubmit={handleVerificationSubmit}
      />
    {:else}
      <SignInForm
        {step}
        {isLoading}
        onSignIn={(provider) => signIn(provider)}
        onSubmit={handleFormSubmit}
        onToggleMode={() => {
          step = step === "signIn" ? "signUp" : "signIn";
        }}
      />
    {/if}
  </div>
</div>
