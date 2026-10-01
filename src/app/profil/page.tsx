import type { Metadata } from "next";
import { getProfile, requireUser } from "@/lib/auth";
import { formatTrPhone } from "@/lib/phone";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage({ searchParams }: PageProps<"/profil">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : null;
  const user = await requireUser("/profil");
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-bold text-slate-900">{profile ? "Profilim" : "Kaydı tamamla"}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {user.phone ? `Telefon: ${formatTrPhone(`+${user.phone.replace(/^\+/, "")}`)}` : null}
      </p>
      <div className="card mt-5">
        <ProfileForm
          isNew={!profile}
          next={next}
          defaultValues={{
            full_name: profile?.full_name ?? "",
            role: profile?.role ?? "shipper",
            vehicle_type: profile?.vehicle_type ?? "",
            plate: profile?.plate ?? "",
            kvkk: Boolean(profile),
          }}
        />
      </div>
    </div>
  );
}
