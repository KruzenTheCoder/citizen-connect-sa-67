
import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type ProvinceName =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Northern Cape'
  | 'Western Cape';

interface ProvinceDistricts {
  province: ProvinceName;
  districts: string[];
}

// Full list of South African District Municipalities (Category C)
const DISTRICTS_BY_PROVINCE: ProvinceDistricts[] = [
  {
    province: 'Eastern Cape',
    districts: ['Alfred Nzo', 'Amathole', 'Chris Hani', 'Joe Gqabi', 'OR Tambo', 'Sarah Baartman'],
  },
  {
    province: 'Free State',
    districts: ['Fezile Dabi', 'Lejweleputswa', 'Thabo Mofutsanyana', 'Xhariep'],
  },
  {
    province: 'Gauteng',
    districts: ['Sedibeng', 'West Rand'],
  },
  {
    province: 'KwaZulu-Natal',
    districts: [
      'Amajuba',
      'Harry Gwala',
      'iLembe',
      'King Cetshwayo',
      'Ugu',
      'uMgungundlovu',
      'uMkhanyakude',
      'uMzinyathi',
      'uThukela',
      'Zululand',
    ],
  },
  {
    province: 'Limpopo',
    districts: ['Capricorn', 'Mopani', 'Sekhukhune', 'Vhembe', 'Waterberg'],
  },
  {
    province: 'Mpumalanga',
    districts: ['Ehlanzeni', 'Gert Sibande', 'Nkangala'],
  },
  {
    province: 'North West',
    districts: ['Bojanala Platinum', 'Dr Kenneth Kaunda', 'Dr Ruth Segomotsi Mompati', 'Ngaka Modiri Molema'],
  },
  {
    province: 'Northern Cape',
    districts: ['Frances Baard', 'John Taolo Gaetsewe', 'Namakwa', 'Pixley ka Seme', 'ZF Mgcawu'],
  },
  {
    province: 'Western Cape',
    districts: ['Cape Winelands', 'Central Karoo', 'Garden Route', 'Overberg', 'West Coast'],
  },
];

const flattenForSearch = (data: ProvinceDistricts[]) =>
  data.flatMap((p) => p.districts.map((d) => ({ district: d, province: p.province })));

export const MunicipalitiesList: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredData = useMemo<ProvinceDistricts[]>(() => {
    if (!query.trim()) return DISTRICTS_BY_PROVINCE;
    const q = query.toLowerCase();
    return DISTRICTS_BY_PROVINCE.map((p) => ({
      province: p.province,
      districts: p.districts.filter((d) => d.toLowerCase().includes(q)),
    })).filter((p) => p.districts.length > 0);
  }, [query]);

  const totalCount = useMemo(() => DISTRICTS_BY_PROVINCE.reduce((acc, p) => acc + p.districts.length, 0), []);
  const filteredCount = useMemo(() => filteredData.reduce((acc, p) => acc + p.districts.length, 0), [filteredData]);

  const searchResults = useMemo(() => flattenForSearch(filteredData), [filteredData]);

  return (
    <div className="w-full p-6 mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Municipalities</h2>
          <p className="text-sm text-muted-foreground">Browse all South African district municipalities</p>
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredCount} of {totalCount}
        </Badge>
      </div>

      <div className="mt-4">
        <Input
          placeholder="Search district or province..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredCount === 0 ? (
        <div className="text-center text-muted-foreground py-16">No districts match your search.</div>
      ) : (
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full" defaultValue={filteredData[0]?.province}>
            {filteredData.map((prov) => (
              <AccordionItem key={prov.province} value={prov.province}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{prov.province}</span>
                    <Badge variant="outline">{prov.districts.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {prov.districts.map((d) => (
                      <Card key={d} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-foreground">{d}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Coverage: District municipality within {prov.province}
                            </div>
                          </div>
                          <Badge variant="secondary">District</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default MunicipalitiesList;
