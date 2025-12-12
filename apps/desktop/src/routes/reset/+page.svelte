<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    <div class="card-body">
      <h1 class="text-2xl font-bold">Reset Password</h1>
      <p class="text-base-content/70 text-sm">
        Password reset is not yet implemented. Please contact support.
      </p>
      <div class="form-control mt-6">
        <button class="btn btn-primary" onclick={() => goto("/signin")}>
          Back to Sign In
        </button>
      </div>
    </div>
  </div>
</div>
