"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../utils/api";
import { ShieldCheck, ShieldX, MapPin, CheckCircle2, Loader2 } from "lucide-react";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

export default function VerifyPage() {
  const { certNumber } = useParams();
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/verify/${certNumber}`)
      .then((res) => setResult({ valid: true, data: res.data.data }))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [certNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1F1A] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <Loader2 size={32} className="text-amber-500/50 animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm tracking-widest uppercase">Verifying certificate…</p>
        </div>
      </div>
    );
  }

  const valid = result?.valid;
  const d     = result?.data;

  return (
    <div className="min-h-screen bg-[#0D1F1A] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      <div className="w-full max-w-md">

        {/* Brand */}
        <p className="text-center text-[10px] font-black tracking-[0.35em] text-amber-500/50 mb-8">
          SPROUTVEST CERTIFICATE VERIFICATION
        </p>

        <div className="rounded-3xl border overflow-hidden"
          style={{
            borderColor: valid ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)",
            background: valid
              ? "linear-gradient(160deg, rgba(52,211,153,0.05) 0%, rgba(13,31,26,0) 60%)"
              : "linear-gradient(160deg, rgba(239,68,68,0.05) 0%, rgba(13,31,26,0) 60%)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}>

          {/* Status header */}
          <div className="px-8 pt-8 pb-6 text-center border-b"
            style={{ borderColor: valid ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", background: "rgba(0,0,0,0.15)" }}>

            <div className="flex justify-center mb-5">
              {valid
                ? <ShieldCheck size={52} className="text-emerald-400" strokeWidth={1.5} />
                : <ShieldX     size={52} className="text-red-400"     strokeWidth={1.5} />}
            </div>

            <h1 className="text-2xl font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: valid ? "#34d399" : "#f87171" }}>
              {valid ? "Certificate Valid" : "Certificate Invalid"}
            </h1>
            <p className="text-xs text-white/30">
              {valid
                ? "This certificate has been verified and its signature is authentic."
                : "This certificate number was not found or its signature does not match."}
            </p>
          </div>

          {/* Certificate details */}
          {valid && d && (
            <div className="px-8 py-6 space-y-4">

              <div className="text-center mb-6">
                <p className="text-xs text-white/30 italic mb-2">Issued to</p>
                <p className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {d.owner_name}
                </p>
              </div>

              {[
                ["Certificate No.",   d.cert_number,       true],
                ["Property",          d.property_title,    false],
                ["Location",          d.property_location, false],
                ["Units Held",        Number(d.units).toLocaleString() + " units", false],
                ["Issue Date",        fmtDate(d.issued_at), false],
                ["Status",            d.status?.toUpperCase(), false],
              ].map(([label, value, mono]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 shrink-0 w-32 mt-0.5">
                    {label}
                  </span>
                  <span className={`text-sm text-right break-all ${mono ? "font-mono text-white/40 text-xs" : "text-white/75"}`}>
                    {value ?? "—"}
                  </span>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400/70">
                  Digital signature verified · Issued by SproutVest Technologies Ltd
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-5 border-t border-white/[0.05] text-center"
            style={{ background: "rgba(0,0,0,0.1)" }}>
            <p className="text-[9px] text-white/20">
              SproutVest Technologies Ltd · sproutvest.com · info@sproutvest.com
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          <Link href="/" className="hover:text-amber-500 transition-colors">sproutvest.com</Link>
        </p>
      </div>
    </div>
  );
}