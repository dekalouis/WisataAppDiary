const API_BASE_URL = 'https://project-tempest-hiring.up.railway.app';

export async function getDiaryFeed(): Promise<any[]> {
  const ids = [
    359007, 358317, 343275, 342861, 342723, 342240, 341343, 296907, 253782,
    177123,
  ];

  const url = new URL(`${API_BASE_URL}/cms/diary`);
  ids.forEach((id) => url.searchParams.append('id', id.toString()));
  url.searchParams.append('status', 'posted');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Error fetching feed: ${response.status}`);
  const data = await response.json();
  return data.content;
}

export async function getDiaryContentById(id: number): Promise<any> {
  const url = new URL(`${API_BASE_URL}/cms/diary`);
  url.searchParams.append('id', id.toString());
  url.searchParams.append('status', 'posted');

  const response = await fetch(url.toString());
  if (!response.ok)
    throw new Error(`Error fetching entry ${id}: ${response.status}`);
  const data = await response.json();
  return data.content;
}
