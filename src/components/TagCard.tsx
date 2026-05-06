import type { Tag } from "../types/Tag";
interface Props{
    tag: Tag;
}

function TagCard({ tag }: Props) {
    return (
        <div className="tag-card">
            <span className="tag-pill">
                {tag.name}
            </span>
        </div>
    );
}

export default TagCard;
