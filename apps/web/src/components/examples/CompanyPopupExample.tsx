import { useState } from 'react';
import { WebsiteEmbed } from '../ui/WebsiteEmbed';
import { InlineWebsiteEmbed } from '../ui/InlineWebsiteEmbed';

interface Company {
  name: string;
  website: string;
}

export function CompanyPopupExample() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [embedMode, setEmbedMode] = useState<'modal' | 'inline' | null>(null);

  const companies = [
    { name: 'OpenAI', website: 'https://openai.com' },
    { name: 'Anthropic', website: 'https://anthropic.com' },
  ];

  const handleCompanyClick = (company: Company, mode: 'modal' | 'inline') => {
    setSelectedCompany(company);
    setEmbedMode(mode);
  };

  const closeEmbed = () => {
    setSelectedCompany(null);
    setEmbedMode(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Companies</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {companies.map((company) => (
          <div key={company.name} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{company.name}</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCompanyClick(company, 'modal')}
                className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Open in Modal
              </button>
              <button
                onClick={() => handleCompanyClick(company, 'inline')}
                className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Open Inline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline embed section */}
      {selectedCompany && embedMode === 'inline' && (
        <div className="mb-6">
          <InlineWebsiteEmbed
            url={selectedCompany.website}
            title={selectedCompany.name}
            onClose={closeEmbed}
            height="400px"
          />
        </div>
      )}

      {/* Modal embed */}
      {selectedCompany && embedMode === 'modal' && (
        <WebsiteEmbed
          url={selectedCompany.website}
          title={selectedCompany.name}
          onClose={closeEmbed}
        />
      )}
    </div>
  );
}