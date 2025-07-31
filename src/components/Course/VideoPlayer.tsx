import React from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';

interface BasicVideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const BasicVideoPlayer: React.FC<BasicVideoPlayerProps> = ({
  src,
  className = '',
  autoPlay = false,
  muted = false,
  loop = false
}) => {

  return (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
        <div className="relative aspect-video">
          <ReactPlayer
            src={src}
            width="100%"
            height="100%"
            controls={true}
            playing={autoPlay}
            loop={loop}
            muted={muted}
            style={{ backgroundColor: '#000' }}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        Space: Play/Pause • M: Mute • F: Fullscreen • ←/→: Seek
      </div>    </motion.div>
  );
};

export default BasicVideoPlayer;
