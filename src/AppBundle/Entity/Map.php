<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="vt_map")
 */
class Map{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
	/**
	 * @ORM\Column(type="string")
	 */
	private $title;
	/**
	 * @ORM\Column(type="datetime")
	 */
	private $releasedAt;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $createdBy;
	/**
	 * @ORM\Column(type="datetime")
	 */
	private $createdAt;

    /**
     * Gets the value of id.
     * @return mixed
     */
    public function getId(){
        return $this->id;
    }
    /**
     * Sets the value of id.
     * @param mixed $id the id
     * @return self
     */
    private function _setId($id){
        $this->id = $id;
        return $this;
    }
    /**
     * Gets the value of title.
     * @return mixed
     */
    public function getTitle(){
        return $this->title;
    }
    /**
     * Sets the value of title.
     * @param mixed $title the title
     * @return self
     */
    private function _setTitle($title){
        $this->title = $title;
        return $this;
    }
    /**
     * Gets the value of releasedAt.
     * @return mixed
     */
    public function getReleasedAt(){
        return $this->releasedAt;
    }
    /**
     * Sets the value of releasedAt.
     * @param mixed $releasedAt the released at
     * @return self
     */
    private function _setReleasedAt($releasedAt){
        $this->releasedAt = $releasedAt;
        return $this;
    }
    /**
     * Gets the value of createdBy.
     * @return mixed
     */
    public function getCreatedBy(){
        return $this->createdBy;
    }
    /**
     * Sets the value of createdBy.
     * @param mixed $createdBy the created by
     * @return self
     */
    private function _setCreatedBy($createdBy){
        $this->createdBy = $createdBy;
        return $this;
    }
    /**
     * Gets the value of createdAt.
     * @return mixed
     */
    public function getCreatedAt(){
        return $this->createdAt;
    }
    /**
     * Sets the value of createdAt.
     * @param mixed $createdAt the created at
     * @return self
     */
    private function _setCreatedAt($createdAt){
        $this->createdAt = $createdAt;
        return $this;
    }
}
