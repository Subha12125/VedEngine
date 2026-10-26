

/**
 * Loading Spinner Component - Claude Warm Beige Theme
 */
export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#ebdcc9] border-t-[#d97757] animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-[#f4ebd9] animate-pulse" />
      </div>
      {message && (
        <p className="text-sm font-semibold text-[#786b5e] animate-pulse tracking-wide font-serif">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf4ec]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
