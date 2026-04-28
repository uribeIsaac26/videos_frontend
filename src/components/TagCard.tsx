import type { Tag } from "../types/Tag";
interface Props{
    tag: Tag;
}

function TagCard({tag}: Props){
    return (
    <div className="tag-card">
       <button
       key={tag.id}
       className="tag-pill clickable">
        {tag.name}
       </button>
       
    </div>
  );
}

export default TagCard;
