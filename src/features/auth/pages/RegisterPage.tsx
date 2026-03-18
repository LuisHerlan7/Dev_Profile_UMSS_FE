import { Link } from 'react-router-dom';
import { Button } from '@shared/components/ui/Button';

export function RegisterPage() {
  return (
    <main className="container-page py-14">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Register</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Página base de registro (placeholder). Aquí luego conectamos el flujo con UMSS email
          y GitHub.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button className="w-full sm:w-auto">Go to Login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

