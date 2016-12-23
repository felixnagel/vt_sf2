<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity
 * @ORM\Table(name="vt_player")
 */
class Player implements UserInterface, \Serializable{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
    
    /**
     * @ORM\Column(type="string")
     */
    private $email;
    
    /**
     * @ORM\Column(type="string")
     */
    private $pw;
	
    /**
	 * @ORM\Column(type="string")
	 */
	private $name;
	
    /**
	 * @ORM\Column(type="string")
	 */
	private $role = 'player';
    
    /**
     * @ORM\Column(type="string")
     */
    private $createdAt;
	
    /**
	 * @ORM\Column(type="string")
	 */
	private $updatedAt;

    public function getId(){
        return $this->id;
    }

    public function setId($id){
        $this->id = $id;
        return $this;
    }

    public function eraseCredentials(){}

    public function getUsername(){
        return $this->getEmail();
    }

    public function getEmail(){
        return $this->email;
    }

    public function getSalt(){}

    public function setEmail($email){
        $this->email = $email;
        return $this;
    }

    public function getPassword(){
        return $this->getPw();
    }

    public function getPw(){
        return $this->getPw();
    }

    public function getRoles(){}

    public function setPw($pw){
        $this->pw = $pw;
        return $this;
    }

    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name = $name;
        return $this;
    }

    public function getRole(){
        return $this->role;
    }

    public function setRole($role){
        $this->role = $role;
        return $this;
    }

    public function getCreatedAt(){
        return $this->createdAt;
    }

    public function setCreatedAt($createdAt){
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(){
        return $this->updatedAt;
    }

    public function setUpdatedAt($updatedAt){
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function serialize(){
        return serialize([$this->id, $this->username, $this->password]);
    }
    
    public function unserialize($serialized){
        list($this->id, $this->username, $this->password) = unserialize($serialized);
    }    
}
