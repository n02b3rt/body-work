type FullBleedVideoProps = {
  src: string;
};

/** Full-viewport-height video break: the scraped reference's hero video sits in its
 * own section below the title block, not layered behind the hero text (see Hero). */
export function FullBleedVideo({ src }: FullBleedVideoProps) {
  return (
    <section className="relative h-[70vh] w-full sm:h-screen">
      <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
        <source src={src} type="video/mp4" />
      </video>
    </section>
  );
}
