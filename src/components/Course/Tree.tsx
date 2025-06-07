"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { cn, getFileIcon, getFolderIcon } from "@/lib/utils";

type TreeViewElement = {
  id: string;
  name: string;
  isSelectable?: boolean;
  children?: TreeViewElement[];
};

type TreeContextProps = {
  selectedId: string | undefined;
  expandedItems: string[] | undefined;
  handleExpand: (id: string) => void;
  selectItem: (id: string) => void;
  setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
};

const TreeContext = createContext<TreeContextProps | null>(null);

const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};

const MinimalTree = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  initialExpandedItems?: string[];
}>(
  ({ children, className, initialExpandedItems = [] }, ref) => {
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(initialExpandedItems);

    // Update expanded items when initialExpandedItems changes
    useEffect(() => {
      setExpandedItems(initialExpandedItems);
    }, [initialExpandedItems]);

    // Update expanded items when initialExpandedItems changes
    useEffect(() => {
      setExpandedItems(initialExpandedItems);
    }, [initialExpandedItems]);

    const selectItem = useCallback((id: string) => {
      setSelectedId(id);
    }, []);

    const handleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        if (prev?.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...(prev ?? []), id];
      });
    }, []);

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expandedItems,
          handleExpand,
          selectItem,
          setExpandedItems,
        }}
      >
        <div className={cn("w-full", className)} ref={ref}>
          <AccordionPrimitive.Root
            type="multiple"
            value={expandedItems}
            onValueChange={setExpandedItems}
            className="space-y-0.5"
          >
            {children}
          </AccordionPrimitive.Root>
        </div>
      </TreeContext.Provider>
    );
  },
);

MinimalTree.displayName = "MinimalTree";

const Folder = forwardRef<HTMLDivElement, {
  element: string;
  value: string;
  children: React.ReactNode;
}>(({ element, value, children }, ref) => {
  const { handleExpand, expandedItems } = useTree();
  const isExpanded = expandedItems?.includes(value);

  return (
    <AccordionPrimitive.Item value={value} className="group">
      <AccordionPrimitive.Trigger
        className="flex items-center gap-2 py-0.5 text-sm text-white/70 hover:text-white/90 transition-colors w-full text-left"
        onClick={() => handleExpand(value)}
      >
        <span className={`${getFolderIcon(element, !!isExpanded)} nf text-[#63a1ff]/60 text-xs`}></span>
        <span className="font-mono">{element} /</span>
      </AccordionPrimitive.Trigger>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
          <AccordionPrimitive.Root
            type="multiple"
            value={expandedItems}
            className="space-y-0.5"
          >
            {children}
          </AccordionPrimitive.Root>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
});

Folder.displayName = "Folder";

const File = forwardRef<HTMLButtonElement, {
  value: string;
  children: React.ReactNode;
}>(({ value, children }, ref) => {
  const { selectedId, selectItem } = useTree();
  const isSelected = selectedId === value;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center gap-2 py-0.5 text-sm transition-colors w-full text-left",
        isSelected ? "text-[#63a1ff]" : "text-white/60 hover:text-white/80"
      )}
      onClick={() => selectItem(value)}
    >
      <span className={`${getFileIcon(children as string)} nf text-[#63a1ff]/60 text-xs`}></span>
      <span className="font-mono">{children}</span>
    </button>
  );
});

File.displayName = "File";

interface FridayFileTreeProps {
  data: TreeViewElement[];
  className?: string;
}

const FridayFileTree: React.FC<FridayFileTreeProps> = ({ data, className = '' }) => {
  const [initialExpandedItems, setInitialExpandedItems] = useState<string[]>([]);

  // Auto-expand first level folders on mount/data change
  useEffect(() => {
    const firstLevelFolders = data
      .filter(element => element.children && element.children.length > 0)
      .map(element => element.id);

    setInitialExpandedItems(firstLevelFolders);
  }, [data]);

  const renderTree = (elements: TreeViewElement[]) => {
    return elements.map((element) => {
      if (element.children && element.children.length > 0) {
        return (
          <Folder
            key={element.id}
            element={element.name}
            value={element.id}
          >
            {renderTree(element.children)}
          </Folder>
        );
      } else {
        return (
          <File key={element.id} value={element.id}>
            {element.name}
          </File>
        );
      }
    });
  };

  return (
    <div className={`my-4 ${className} `}>
      <div className="relative pl-4 border-l-2 border-[#63a1ff]/25">
        <div className="text-xs text-white/40 mb-3 -ml-4 pl-4">
          <span className="nf nf-cod-folder text-[11px] mr-2"></span>
          <span className="uppercase tracking-wider font-medium">Project Structure</span>
        </div>
        <div className="-ml-4 pl-4">
          <MinimalTree initialExpandedItems={initialExpandedItems}>
            {renderTree(data)}
          </MinimalTree>
        </div>
      </div>
    </div>
  );
};

export { FridayFileTree, type TreeViewElement };
