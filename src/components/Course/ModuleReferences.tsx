import { motion } from 'framer-motion';
import { LinkPreview } from "@/components/ui/link-preview";
import { Link } from 'lucide-react';

interface ModuleReferencesProps {
  references: string[];
}

const ModuleReferences: React.FC<ModuleReferencesProps> = ({ references }) => {
  const validLinks = references.filter(ref => ref && ref.startsWith('http'));

  if (validLinks.length === 0) {
    return null;
  }

  const getWebsiteName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 2];
      }
      return hostname;
    } catch (error) {
      return 'link';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-light text-white/80 mb-4">Related Resources</h3>
      <div className="flex flex-wrap gap-4">
        {validLinks.map((link, index) => (
          <LinkPreview key={index} url={link}>
            <motion.div
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-500 transition-colors duration-200 capitalize"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link size={14} />
              {getWebsiteName(link)}
            </motion.div>
          </LinkPreview>
        ))}
      </div>
    </div>
  );
};

export default ModuleReferences;
