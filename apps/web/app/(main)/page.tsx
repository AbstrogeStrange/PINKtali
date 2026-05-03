export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Recommended for you</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="flex flex-col gap-2 group cursor-pointer">
              <div className="aspect-video bg-muted rounded-xl relative overflow-hidden">
                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                  12:34
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary">
                    Building a YouTube Clone with Next.js 14 and Tailwind CSS
                  </h3>
                  <span className="text-sm text-muted-foreground mt-1 hover:text-foreground">Code With Me</span>
                  <span className="text-xs text-muted-foreground">120K views • 2 days ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
