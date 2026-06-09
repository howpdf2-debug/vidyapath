// app/sarkari-naukri/[id]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, DollarSign, MapPin, Users, Briefcase, GraduationCap, Clock, FileText, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';

interface JobDetailPageProps {
  params: { id: string };
}

async function getJob(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateStaticParams() {
  const { data } = await supabase.from('jobs').select('id');
  return data?.map((job) => ({ id: job.id })) || [];
}

// Helper Components
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
      <div className="text-purple-600">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">{icon} {title}</h2>
      <div className="pl-1 border-l-2 border-purple-200">{children}</div>
    </div>
  );
}

function RenderExtraSection({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  if (Array.isArray(data)) {
    return (
      <Section title={title} icon={<HelpCircle size={20} />}>
        <div className="space-y-3">
          {data.map((item: any, idx: number) => (
            <div key={idx} className="border-b pb-2">
              <p className="font-semibold">{item.question}</p>
              <p className="text-gray-600 text-sm">{item.answer}</p>
            </div>
          ))}
        </div>
      </Section>
    );
  }
  if (typeof data === 'string') {
    return (
      <Section title={title} icon={<FileText size={20} />}>
        <p className="text-gray-700">{data}</p>
      </Section>
    );
  }
  return null;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJob(params.id);
  if (!job) notFound();

  const extra = job.extra_details || {};
  const formatArray = (arr: any) => Array.isArray(arr) ? arr.join(', ') : arr;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <Link href="/sarkari-naukri" className="hover:text-purple-600">Sarkari Naukri</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">{job.title}</span>
      </div>

      <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-6">
          <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
          <p className="text-purple-200 mt-1">{job.org}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoCard icon={<Briefcase size={18} />} label="Total Posts" value={job.posts?.toLocaleString() || 'Not specified'} />
            <InfoCard icon={<GraduationCap size={18} />} label="Qualification" value={formatArray(job.qual)} />
            <InfoCard icon={<Calendar size={18} />} label="Age Limit" value={`${job.age_min || '?'} - ${job.age_max || '?'} years`} />
            <InfoCard icon={<DollarSign size={18} />} label="Salary" value={`₹${job.sal_min?.toLocaleString() || '?'} - ₹${job.sal_max?.toLocaleString() || '?'} per month`} />
            <InfoCard icon={<Clock size={18} />} label="Last Date" value={new Date(job.last_date).toLocaleDateString('en-IN')} />
            <InfoCard icon={<FileText size={18} />} label="Application Fee" value={job.application_fee || 'Check notification'} />
          </div>

          {job.description && (
            <Section title="📌 Job Description" icon={<Briefcase size={20} />}>
              <p className="text-gray-700">{job.description}</p>
            </Section>
          )}

          {job.selection_process && (
            <Section title="⚙️ Selection Process" icon={<CheckCircle size={20} />}>
              <p className="text-gray-700">{job.selection_process}</p>
            </Section>
          )}

          {job.important_dates && (
            <Section title="📅 Important Dates" icon={<Calendar size={20} />}>
              <p className="text-gray-700">{job.important_dates}</p>
            </Section>
          )}

          {job.how_to_apply && (
            <Section title="📝 How to Apply (Step-by-Step)" icon={<FileText size={20} />}>
              <div className="space-y-2">
                {(job.how_to_apply || '').split('\n').map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{idx+1}</span>
                    <span className="text-gray-700">{step.trim()}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {job.required_docs && (
            <Section title="📄 Required Documents" icon={<FileText size={20} />}>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {job.required_docs.split(',').map((doc: string, idx: number) => <li key={idx}>{doc.trim()}</li>)}
              </ul>
            </Section>
          )}

          {job.exam_centers && (
            <Section title="📍 Exam Centers" icon={<MapPin size={20} />}>
              <p className="text-gray-700">{job.exam_centers}</p>
            </Section>
          )}

          <RenderExtraSection title="📖 Eligibility FAQs (Students' Common Questions)" data={extra.eligibility_faq} />
          <RenderExtraSection title="💰 Salary in Hand (Estimated)" data={extra.salary_breakdown} />
          <RenderExtraSection title="🔗 Bond / Service Agreement" data={extra.bond_details} />
          <RenderExtraSection title="📚 Exam Pattern" data={extra.exam_pattern} />
          {extra.syllabus_link && (
            <Section title="📖 Syllabus & Official Resources" icon={<FileText size={20} />}>
              <a href={extra.syllabus_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Download Syllabus PDF ↗</a>
            </Section>
          )}
          <RenderExtraSection title="📊 Previous Year Cut-off (Approx)" data={extra.previous_cutoff} />
          <RenderExtraSection title="🎫 Admit Card Expected Date" data={extra.admit_card_date} />
          <RenderExtraSection title="📅 Result Expected Date" data={extra.result_date} />
          <RenderExtraSection title="📞 Official Helpline / Contact" data={extra.helpline} />
          <RenderExtraSection title="📖 Preparation Tips for Students" data={extra.preparation_tips} />

          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <a href={job.apply_url} target="_blank" rel="nofollow noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition">
              Apply Now <ExternalLink size={16} />
            </a>
            {job.official_website && (
              <a href={job.official_website} target="_blank" rel="nofollow noopener noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition">
                Official Website <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-6 text-sm rounded">
        ℹ️ <strong>Disclaimer:</strong> All information is sourced from official notifications. Please confirm details on the official website before applying. We are not responsible for any changes.
      </div>
    </div>
  );
}