import type { Tag } from "../types/Tag";

interface Props{
    tag: Tag;
}

function TagCard({tag}: Props){
    return (
    <div className="tag-card">
       <p>{tag.name}</p>
    </div>
  );
}

export default TagCard;
